import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import FeedbackButtons from './FeedbackButtons';
import FeedbackModal from './FeedbackModal';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import './TypingIndicator.css';

interface Message {
  id?: number;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatbotProps {
  currentConversationId: number | null;
  setCurrentConversationId: (id: number | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  onSendMessage: (message: string) => Promise<void>;
  conversations: { id: number; title: string }[];
}

const Chatbot: React.FC<ChatbotProps> = ({
  currentConversationId,
  messages,
  setMessages,
  onSendMessage,
  conversations,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = { text: userInput, sender: 'user' };
    setMessages([...messages, userMessage]);

    const originalInput = userInput;
    setUserInput('');
    setIsTyping(true);
    await onSendMessage(originalInput);
    setIsTyping(false);
  };

  const handleFeedbackSubmit = async (
    messageId: number,
    feedbackType: 'like' | 'dislike',
    comment: string,
    reason: string
  ) => {
    const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No token found');
      return;
    }

    const feedbackData = {
      message_id: messageId,
      feedback_type: feedbackType,
      comment: reason ? `${reason}: ${comment}` : comment,
    };

    try {
      const res = await fetch(`${BACKEND_API}/chat/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log('Feedback submitted');
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setIsFeedbackModalOpen(false);
    }
  };

  const handleDislikeClick = (id: number) => {
    setSelectedMessageId(id);
    setIsFeedbackModalOpen(true);
  };

  const handleExampleQuestionClick = (text: string) => setUserInput(text);

  const exampleQuestions = [
    'ใบเสร็จรับเงินค่าน้ำมันเชื้อเพลิง ใช้เป็นหลักฐานทางราชการได้หรือไม่',
    'หากต้องจ่ายค่าเช่าที่พักสูง กว่าอัตราที่ระเบียบกำหนด จะสามารถเบิกจ่ายได้หรือไม่',
    'ขั้นตอนการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน มีอะไรบ้าง',
    'การเบิกจ่ายค่าใช้จ่ายใช้หลัก อะไรบ้าง',
  ];

  return (
    <div className="flex flex-col h-full bg-chat-bg">
      {/* Conversation header */}
      {currentConversation && (
        <div className="p-4 border-b border-neutral-700/50 bg-neutral-800/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">{currentConversation.title}</h2>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages area */}
      <div ref={chatBoxRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isTyping ? (
          // Welcome screen
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                <span className="gradient-text">สวัสดี👋</span>
              </h1>
              <h2 className="text-2xl font-semibold text-white mb-2">ผมคือ LannaFinChat</h2>
              <p className="text-neutral-400 text-lg max-w-2xl">
                "มีคำถามอะไร ให้ช่วยเกี่ยวกับการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน ไหมครับ"
              </p>
            </div>

            {/* Example questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleQuestionClick(q)}
                  className="card p-6 text-left hover:bg-neutral-700/50 transition-all duration-200 transform hover:scale-105 focus-ring group"
                >
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-3 mt-1 group-hover:from-primary-500/30 group-hover:to-purple-600/30 transition-all duration-200">
                      <Sparkles className="w-4 h-4 text-primary-400" />
                    </div>
                    <p className="text-white font-medium leading-relaxed">{q}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages list
          <div className="p-6 space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
              >
                <div className={`flex items-start max-w-3xl ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-3 flex-shrink-0 ${
                    msg.sender === 'bot' 
                      ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow' 
                      : 'bg-gradient-to-br from-neutral-600 to-neutral-700'
                  }`}>
                    {msg.sender === 'bot' ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message content */}
                  <div className={`p-4 rounded-2xl max-w-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg' 
                      : 'bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 text-neutral-200'
                  }`}>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.text }} />
                    
                    {/* Feedback buttons for bot messages */}
                    {msg.sender === 'bot' && msg.id && (
                      <div className="mt-3">
                        <FeedbackButtons
                          messageId={msg.id}
                          onDislikeClick={() => handleDislikeClick(msg.id!)}
                          onFeedbackSubmit={(type, comment, reason) =>
                            handleFeedbackSubmit(msg.id!, type, comment || '', reason || '')
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start p-6">
            <div className="flex items-start max-w-3xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-3 bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 p-4 rounded-2xl flex items-center">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-6 bg-neutral-800/30 backdrop-blur-sm border-t border-neutral-700/50">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 rounded-2xl shadow-lg">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="ส่งข้อความถึง LannaFinChat..."
              className="w-full bg-transparent p-4 pr-16 text-white placeholder-neutral-400 focus:outline-none resize-none rounded-2xl"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:from-neutral-600 disabled:to-neutral-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 focus-ring"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-xs text-center text-neutral-500 mt-3">
            สร้างโดย AI เพื่อใช้ในการอ้างอิงเท่านั้น
          </p>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={(comment, reason) => {
          if (selectedMessageId != null) {
            handleFeedbackSubmit(selectedMessageId, 'dislike', comment, reason);
          }
        }}
      />
    </div>
  );
};

export default Chatbot;
