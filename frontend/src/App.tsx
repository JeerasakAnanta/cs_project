import React, { useState, useEffect } from 'react';
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

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

interface Message {
  id?: number;
  text: string;
  sender: 'user' | 'bot';
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<{ id: number; title: string }[]>([]);
  const authToken = localStorage.getItem('authToken');

  const handleConversationDeleted = (id: number) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  // Fetch conversations logic needs to be added or updated in App.tsx
  // This is a placeholder to show where it should be.
  useEffect(() => {
    const fetchConversations = async () => {
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
    };
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);


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

  const handleSelectConversation = async (id: number) => {
    setCurrentConversationId(id);
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
  };

  const handleSendMessage = async (messageContent: string) => {
    let conversationId = currentConversationId;
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
        conversations={conversations}
      />
      <main className="flex-1 flex flex-col overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Chatbot
                  currentConversationId={currentConversationId}
                  setCurrentConversationId={setCurrentConversationId}
                  messages={messages}
                  setMessages={setMessages}
                  onSendMessage={handleSendMessage}
                  conversations={conversations}
                />
              </PrivateRoute>
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
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
