import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OfflineProvider } from './contexts/OfflineContext';

// Components
import { Navbar, ErrorBoundary } from './components/common';
import { Login, Register, AdminRoute, GuestRoute } from './components/auth';
import { Chatbot, TypingTest } from './components/chat';
import { Pagenotfound } from './components/pages';
import { PDFManager } from './components/pdf';
import AdminDashboard from './components/AdminDashboard';
import OfflineIndicator from './components/common/ui/OfflineIndicator';

// Services
import {
  guestPostgreSQLService,
  GuestConversation,
} from './services/GuestPostgreSQLService';

const BACKEND_API =
  import.meta.env.VITE_BACKEND_CHATBOT_API || 'http://localhost:8001';
const DOCS_STATIC =
  import.meta.env.VITE_BACKEND_DOCS_STATIC || 'http://localhost:8001';

interface Message {
  id?: number | string;
  text: string;
  sender: 'user' | 'bot';
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const { currentUser, isGuestMode } = useAuth();
  const isLoginPage =
    location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');
  const [currentConversationId, setCurrentConversationId] = useState<
    number | string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<
    { id: number | string; title: string }[]
  >([]);
  const [guestConversations, setGuestConversations] = useState<
    GuestConversation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConversationDeleted = async (id: number | string) => {
    if (isGuestMode()) {
      try {
        await guestPostgreSQLService.deleteConversation(id as string);
        setGuestConversations((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Error deleting guest conversation:', error);
      }
    } else {
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Fetch conversations logic
  const fetchGuestConversations = useCallback(async () => {
    try {
      const conversations = await guestPostgreSQLService.getConversations();
      setGuestConversations(conversations);
    } catch (error) {
      console.error('Error fetching guest conversations:', error);
    }
  }, []);

  const fetchAuthenticatedConversations = useCallback(async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    try {
      const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else if (response.status === 401) {
        // Token is invalid or expired, clear it and let the AuthContext handle redirect
        localStorage.removeItem('authToken');
      } else {
        console.error(
          'Error fetching conversations:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  useEffect(() => {
    if (isGuestMode()) {
      fetchGuestConversations();
    } else if (currentUser) {
      fetchAuthenticatedConversations();
    }
  }, [currentUser, isGuestMode, fetchGuestConversations, fetchAuthenticatedConversations]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const formatBotMessage = async (content: string): Promise<string> => {
    const sourceRegex = /อ้างอิง: <a href="[^"]+"[^>]+>([^<]+)<\/a>/;
    const match = content.match(sourceRegex);

    if (match) {
      const fileName = match[1];
      const fileUrl = `${DOCS_STATIC}/pdfs/${encodeURIComponent(fileName)}`;
      return content.replace(
        sourceRegex,
        `อ้างอิง: <a href="${fileUrl}" target="_blank" class="text-blue-400 hover:text-blue-300 underline">${fileName}</a>`
      );
    }

    return content;
  };

  const handleSelectConversation = async (id: number | string) => {
    setCurrentConversationId(id);

    if (isGuestMode()) {
      // Load guest conversation from PostgreSQL
      try {
        const conversation = await guestPostgreSQLService.getConversation(
          id as string
        );
        if (conversation) {
          const formattedMessages: Message[] = await Promise.all(
            conversation.messages.map(async (msg) => {
              if (msg.sender === 'bot') {
                return {
                  id: msg.id,
                  text: await formatBotMessage(msg.content),
                  sender: 'bot' as const,
                };
              }
              return { id: msg.id, text: msg.content, sender: 'user' as const };
            })
          );
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching guest conversation:', error);
        setMessages([]);
      }
    } else {
      // Load authenticated user conversation
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;
      try {
        const response = await fetch(
          `${BACKEND_API}/chat/conversations/${id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          interface MessageData {
            id: string | number;
            content: string;
            sender: 'user' | 'bot';
          }
          const formattedMessages: Message[] = await Promise.all(
            (data.messages as MessageData[]).map(async (msg) => {
              if (msg.sender === 'bot') {
                return {
                  id: msg.id,
                  text: await formatBotMessage(msg.content),
                  sender: 'bot' as const,
                };
              }
              return { id: msg.id, text: msg.content, sender: 'user' as const };
            })
          );
          setMessages(formattedMessages);
        } else if (response.status === 401) {
          localStorage.removeItem('authToken');
          return;
        } else {
          throw new Error('Failed to fetch conversation');
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        return;
      }
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    setIsLoading(true);

    try {
      if (isGuestMode()) {
        const conversationId = currentConversationId;
        if (!conversationId) {
          const newConversation =
            await guestPostgreSQLService.createConversation(messageContent);
          setCurrentConversationId(newConversation.id);
          setGuestConversations((prev) => [newConversation, ...prev]);
          const botMessage: Message = {
            id: Date.now(),
            text:
              newConversation.messages[newConversation.messages.length - 1]
                ?.content || '',
            sender: 'bot',
          };
          setMessages([
            { id: Date.now() - 1, text: messageContent, sender: 'user' },
            botMessage,
          ]);
        } else {
          const userMessage: Message = {
            id: Date.now(),
            text: messageContent,
            sender: 'user',
          };
          setMessages((prev) => [...prev, userMessage]);

          const response = await guestPostgreSQLService.addMessage(
            conversationId as string,
            messageContent
          );
          const botMessage: Message = {
            id: Date.now() + 1,
            text: response.message || '',
            sender: 'bot',
          };
          setMessages((prev) => [...prev, botMessage]);
          const updatedConversation =
            await guestPostgreSQLService.getConversation(
              conversationId as string
            );
          if (updatedConversation) {
            setGuestConversations((prev) =>
              prev.map((c) =>
                c.id === conversationId ? updatedConversation : c
              )
            );
          }
        }
      } else {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;

        const conversationId = currentConversationId;

        if (!conversationId) {
          try {
            const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ title: messageContent.substring(0, 50) }),
            });

            if (response.ok) {
              const newConversation = await response.json();
              setCurrentConversationId(newConversation.id);
              setConversations((prev) => [newConversation, ...prev]);

              const userMessage: Message = {
                id: Date.now(),
                text: messageContent,
                sender: 'user',
              };
              setMessages([userMessage]);

              const botResponse = await fetch(
                `${BACKEND_API}/chat/conversations/${newConversation.id}/messages/`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: JSON.stringify({
                    sender: 'user',
                    content: messageContent,
                  }),
                }
              );

              if (botResponse.ok) {
                const botMessageData = await botResponse.json();
                if (botMessageData && botMessageData.content) {
                  const formattedText = await formatBotMessage(
                    botMessageData.content
                  );
                  const botMessage: Message = {
                    id: Date.now() + 1,
                    text: formattedText,
                    sender: 'bot',
                  };
                  setMessages((prev) => [...prev, botMessage]);
                }
              }
            } else if (response.status === 401) {
              localStorage.removeItem('authToken');
              return;
            } else {
              throw new Error('Failed to create new conversation');
            }
          } catch (error) {
            console.error(error);
            return;
          }
        } else {
          const userMessage: Message = {
            id: Date.now(),
            text: messageContent,
            sender: 'user',
          };
          setMessages((prevMessages) => [...prevMessages, userMessage]);

          try {
            await fetch(
              `${BACKEND_API}/chat/conversations/${conversationId}/messages/`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                  sender: 'user',
                  content: messageContent,
                }),
              }
            );

            const response = await fetch(
              `${BACKEND_API}/chat/conversations/${conversationId}/messages/`,
              {
                headers: { Authorization: `Bearer ${authToken}` },
              }
            );

            if (response.ok) {
              const botMessageData = await response.json();
              if (botMessageData && botMessageData.length > 0) {
                const lastBotMessage =
                  botMessageData[botMessageData.length - 1];
                const formattedText = await formatBotMessage(
                  lastBotMessage.content
                );
                const botMessage: Message = {
                  id: lastBotMessage.id,
                  text: formattedText,
                  sender: 'bot',
                };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
              }
            } else if (response.status === 401) {
              localStorage.removeItem('authToken');
              return;
            }
          } catch (error) {
            console.error('Error sending message or getting response:', error);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoginPage || isAdminPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pdfs" element={<PDFManager />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-chat-bg overflow-hidden">
      <OfflineIndicator />
      <Navbar
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onConversationDeleted={handleConversationDeleted}
        currentConversationId={currentConversationId}
        conversations={isGuestMode() ? guestConversations : conversations}
      />
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <div className="flex-1 flex flex-col h-full">
                  <Chatbot
                    currentConversationId={currentConversationId}
                    messages={messages}
                    setMessages={setMessages}
                    onSendMessage={handleSendMessage}
                    conversations={
                      isGuestMode() ? guestConversations : conversations
                    }
                    isLoading={isLoading}
                  />
                </div>
              </GuestRoute>
            }
          />

          <Route path="/typing-test" element={<TypingTest />} />
          <Route path="*" element={<Pagenotfound />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <OfflineProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </OfflineProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
