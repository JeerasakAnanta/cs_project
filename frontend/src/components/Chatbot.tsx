import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { marked } from 'marked';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import FeedbackButtons from './FeedbackButtons';
import FeedbackModal from './FeedbackModal';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

interface Message {
  id?: number;
  text: string;
  sender: 'user' | 'bot';
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}

const Chatbot: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userInput, setUserInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

  const { currentUser } = useAuth();
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ title: 'New Conversation' }),
      });
      if (response.ok) {
        const newConversation = await response.json();
        setConversations((prev) => [...prev, newConversation]);
        setCurrentConversationId(newConversation.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const handleSelectConversation = async (id: number) => {
    setCurrentConversationId(id);
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
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = { text: userInput, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const originalUserInput = userInput;
    setUserInput('');
    setIsTyping(true);

    let conversationId = currentConversationId;
    let isNewConversation = false;

    if (!conversationId) {
      isNewConversation = true;
      try {
        const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const newConversation = await response.json();
          setConversations((prev) => [...prev, newConversation]);
          conversationId = newConversation.id;
          setCurrentConversationId(newConversation.id);
        } else {
          console.error('Error creating new conversation');
          setIsTyping(false);
          return;
        }
      } catch (error) {
        console.error('Error creating new conversation:', error);
        setIsTyping(false);
        return;
      }
    }

    if (isNewConversation && conversationId) {
      try {
        await fetch(`${BACKEND_API}/chat/conversations/${conversationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ title: originalUserInput }),
        });
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title: originalUserInput } : c))
        );
      } catch (error) {
        console.error('Error updating conversation title:', error);
      }
    }

    try {
      const response = await fetch(`${BACKEND_API}/chat/conversations/${conversationId}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ sender: 'user', content: originalUserInput }),
      });
      if (response.ok) {
        const botMessageData = await response.json();
        const formattedText = await formatBotMessage(botMessageData.content);
        const botMessage: Message = { id: botMessageData.id, text: formattedText, sender: 'bot' };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedbackSubmit = async (
    messageId: number,
    feedbackType: 'like' | 'dislike',
    comment: string,
    reason: string
  ) => {
    const finalComment = reason === 'Others' ? `Others: ${comment}` : `${reason}: ${comment}`;
    try {
      await fetch(`${BACKEND_API}/chat/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message_id: messageId, feedback_type: feedbackType, comment: finalComment }),
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleDislikeClick = (messageId: number) => {
    setSelectedMessageId(messageId);
    setIsFeedbackModalOpen(true);
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

  const handleDeleteConversation = async (id: number) => {
    try {
      await fetch(`${BACKEND_API}/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const exampleQuestions = [
    'ตัวอย่างค่าเบี้ยเดินทางในประเทศ',
    'ค่าใช้จ่ายในการฝึกอบรม จัดงาน',
    'ค่าใช้จ่ายในการประชุม',
    'ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ',
    'ค่าตอบแทนบุคคลหรือคณะกรรมการเกี่ยวกับการจัดซื้อจัดจ้างและบริหารพัสดุ',
    'ค่าใช้จ่ายในการบริหารงาน',
    'การจัดซื้อจัดจ้างที่มีความจำเป็นเร่งด่วน',
    'การจัดหาพัสดุที่เกี่ยวกับค่าใช้จ่ายในการบริหารงาน',
  ];

  return (
    <div className="flex h-screen bg-gray-200 font-sans">
      {/* Sidebar */}
      <aside
        className={`bg-rmutl-brown text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-20 flex flex-col`}
      >
        <div className="flex justify-between items-center px-4">
          <h2 className="text-2xl font-semibold text-white">History</h2>
          <button onClick={() => setIsSidebarOpen(false)}>
            <ChevronLeftIcon />
          </button>
        </div>
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center bg-rmutl-gold text-rmutl-brown font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={currentConversationId !== null && messages.length === 0}
        >
          <AddCommentIcon className="mr-2" /> New Chat
        </button>
        <nav className="flex-1 overflow-y-auto">
          {conversations
            .slice()
            .reverse()
            .map((convo) => (
            <div
              key={convo.id}
              className={`flex justify-between items-center p-2 my-1 rounded-md cursor-pointer ${
                currentConversationId === convo.id ? 'bg-rmutl-gold text-rmutl-brown' : 'hover:bg-rmutl-light-brown'
              }`}
            >
              <a
                onClick={() => handleSelectConversation(convo.id)}
                className="block flex-grow"
              >
                {convo.title}
              </a>
              <button onClick={() => handleDeleteConversation(convo.id)} className="ml-2 p-1 hover:text-red-500">
                <DeleteForeverIcon fontSize="small" />
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-4 z-10 bg-rmutl-brown text-white p-2 rounded-full"
        >
          <MenuIcon />
        </button>
        
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 overflow-y-auto p-6" ref={chatBoxRef}>
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 && !isTyping ? (
                <div className="text-center text-gray-500">
                  <SmartToyIcon style={{ fontSize: 60 }} className="mx-auto mb-4 text-rmutl-brown" />
                  <h2 className="text-2xl font-bold mb-6 text-rmutl-brown">
                  สวัสดีครับ คุณ {currentUser?.username}, มีอะไรให้ น้องคำเงิน ช่วยไหมครับ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exampleQuestions.map((q, i) => (
                      <div
                        key={i}
                        onClick={() => setUserInput(q)}
                        className="bg-white p-4 rounded-lg hover:bg-rmutl-gold hover:text-rmutl-brown cursor-pointer shadow-md transition-colors"
                      >
                        <p className="font-semibold">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-4 my-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                      <div className="p-2 bg-gray-300 rounded-full">
                        <SmartToyIcon className="text-rmutl-brown" />
                      </div>
                    )}
                    <div className={`p-4 rounded-lg max-w-lg shadow-md ${msg.sender === 'user' ? 'bg-rmutl-gold text-rmutl-brown' : 'bg-white'}`}>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: msg.text }}></div>
                      {msg.sender === 'bot' && msg.id && (
                        <FeedbackButtons
                          messageId={msg.id}
                          onDislikeClick={() => {
                            if (msg.id) {
                              handleDislikeClick(msg.id);
                            }
                          }}
                          onFeedbackSubmit={(feedbackType, comment, reason) => {
                            if (msg.id) {
                              handleFeedbackSubmit(msg.id, feedbackType, comment || '', reason || '');
                            }
                          }}
                        />
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="p-2 bg-gray-300 rounded-full">
                        <AccountCircleIcon className="text-rmutl-brown" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex items-center gap-4 my-4 justify-start">
                  <div className="p-2 bg-gray-300 rounded-full">
                    <SmartToyIcon className="text-rmutl-brown" />
                  </div>
                  <div className="p-4 rounded-lg bg-white shadow-md">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-4 max-w-4xl mx-auto">
              <input
                type="text"
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rmutl-gold"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="p-3 bg-rmutl-brown text-white rounded-lg hover:bg-rmutl-gold hover:text-rmutl-brown disabled:bg-gray-400"
                disabled={isTyping}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </main>
      </div>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={(comment, reason) => {
          if (selectedMessageId) {
            handleFeedbackSubmit(selectedMessageId, 'dislike', comment, reason);
          }
        }}
      />
    </div>
  );
};

export default Chatbot;