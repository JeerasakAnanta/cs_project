import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { marked } from 'marked';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Chatbot from './components/Chatbot';
import Pagenotfound from './components/Pagenotfound';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';


// Auth Wrapper
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';

// Services
import { guestPostgreSQLService, GuestConversation } from './services/GuestPostgreSQLService';
import { anonymousChatService } from './services/AnonymousChatService';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

interface Message {
  id?: number;
  text: string;
  sender: 'user' | 'bot';
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const { currentUser, isGuestMode } = useAuth();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');
  const [currentConversationId, setCurrentConversationId] = useState<number | string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<{ id: number | string; title: string }[]>([]);
  const [guestConversations, setGuestConversations] = useState<GuestConversation[]>([]);

  const handleConversationDeleted = async (id: number | string) => {
    if (isGuestMode()) {
      try {
        await guestPostgreSQLService.deleteConversation(id as string);
        setGuestConversations(prev => prev.filter(c => c.id !== id));
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
    let text = content;
    let sourceLink = '';

    if (match) {
      text = content.replace(sourceRegex, '').trim();
      const sourceData = match[1];
      sourceLink = `\n\nอ้างอิง: <a href="${DOCS_STATIC}/file/${sourceData}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">${sourceData}</a>`;
    }

    const formattedText = await marked.parse(text);
    return formattedText + sourceLink;
  };

  const handleSelectConversation = async (id: number | string) => {
    setCurrentConversationId(id);
    
    if (isGuestMode()) {
      // Load guest conversation from PostgreSQL
      try {
        const conversation = await guestPostgreSQLService.getConversation(id as string);
        if (conversation) {
          const formattedMessages = await Promise.all(
            conversation.messages.map(async (msg) => {
              if (msg.sender === 'bot') {
                return { id: msg.id, text: await formatBotMessage(msg.content), sender: 'bot' };
              }
              return { id: msg.id, text: msg.content, sender: 'user' };
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
        const response = await fetch(`${BACKEND_API}/chat/conversations/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          const formattedMessages = await Promise.all(
            data.messages.map(async (msg: any) => {
              if (msg.sender === 'bot') {
                return { id: msg.id, text: await formatBotMessage(msg.content), sender: 'bot' };
              }
              return { id: msg.id, text: msg.content, sender: 'user' };
            })
          );
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching conversation details:', error);
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (isGuestMode()) {
      await handleGuestSendMessage(messageContent);
    } else {
      await handleAuthenticatedSendMessage(messageContent);
    }
  };

  const handleGuestSendMessage = async (messageContent: string) => {
    let conversationId = currentConversationId as string;
    
    try {
      // Create a new conversation if one doesn't exist
      if (!conversationId) {
        // Use the user's message as the conversation title (truncate if too long)
        const title = messageContent.length > 50 
          ? messageContent.substring(0, 50) + '...' 
          : messageContent;
        
        const newConversation = await guestPostgreSQLService.createConversation(title);
        conversationId = newConversation.id;
        setCurrentConversationId(newConversation.id);
        setGuestConversations(prev => [newConversation, ...prev]);
      }

      // Add user message to guest conversation and get bot response
      const botResponse = await guestPostgreSQLService.addMessage(conversationId, messageContent);

      // Update messages state by fetching the updated conversation
      const conversation = await guestPostgreSQLService.getConversation(conversationId);
      if (conversation) {
        const formattedMessages = await Promise.all(
          conversation.messages.map(async (msg) => {
            if (msg.sender === 'bot') {
              return { id: msg.id, text: await formatBotMessage(msg.content), sender: 'bot' };
            }
            return { id: msg.id, text: msg.content, sender: 'user' };
          })
        );
        setMessages(formattedMessages);
        
        // Update guest conversations list
        setGuestConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? conversation
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error in guest mode chat:', error);
    }
  };

  const handleAuthenticatedSendMessage = async (messageContent: string) => {
    let conversationId = currentConversationId as number;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;
    
    // Create a new conversation if one doesn't exist
    if (!conversationId) {
      try {
        const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ title: messageContent }), // Use message as title
        });
        if (response.ok) {
          const newConversation = await response.json();
          conversationId = newConversation.id;
          setCurrentConversationId(newConversation.id);
          setConversations((prev) => [newConversation, ...prev]);
        } else {
          throw new Error('Failed to create new conversation');
        }
      } catch (error) {
        console.error(error);
        return; // Exit if conversation creation fails
      }
    }

    // Send the user message
    try {
      await fetch(`${BACKEND_API}/chat/conversations/${conversationId}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ sender: 'user', content: messageContent }),
      });

      // Now, get the bot's response
      const response = await fetch(`${BACKEND_API}/chat/conversations/${conversationId}/messages/`, {
          headers: { Authorization: `Bearer ${authToken}` },
      });
      
      const botMessageData = await response.json();
      if (botMessageData && botMessageData.length > 0) {
        const lastBotMessage = botMessageData[botMessageData.length - 1];
        const formattedText = await formatBotMessage(lastBotMessage.content);
        const botMessage: Message = { id: lastBotMessage.id, text: formattedText, sender: 'bot' };
        
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        console.error('No bot message received');
      }

    } catch (error) {
      console.error('Error sending message or getting response:', error);
    }
  };


  if (isLoginPage || isAdminPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-chat-bg text-white overflow-hidden">
      <Navbar
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onConversationDeleted={handleConversationDeleted}
        currentConversationId={currentConversationId}
        conversations={isGuestMode() ? guestConversations : conversations}
      />
      <main className="flex-1 flex flex-col overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <div className="flex-1 flex flex-col">
                  <Chatbot
                    currentConversationId={currentConversationId}
                    setCurrentConversationId={setCurrentConversationId}
                    messages={messages}
                    setMessages={setMessages}
                    onSendMessage={handleSendMessage}
                    conversations={isGuestMode() ? guestConversations : conversations}
                  />
                </div>
              </GuestRoute>
            }
          />
          <Route path="*" element={<Pagenotfound />} />
        </Routes>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
