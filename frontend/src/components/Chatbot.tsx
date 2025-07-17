import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import FeedbackButtons from './FeedbackButtons';
import FeedbackModal from './FeedbackModal';
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
  setCurrentConversationId,
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

  const { currentUser } = useAuth();
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
    'เขียนรายงานการเดินทางและใบรับรองแทน ใบเสร็จรับเงินก่อนเสร็จสิ้นการเดินทางได้หรือไม่',
    'การเดินทางไปท้องถิ่นที่ไม่มีโรงแรมแต่พักบ้าน ชาวบ้านหรือโฮมสเตย์ที่ไม่มีใบเสร็จรับเงิน ทำได้หรือไม่',
  ];

  return (
    <div className="flex flex-col h-full bg-[#343541]">
      {currentConversation && (
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">{currentConversation.title}</h2>
        </div>
      )}

      <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl font-bold mb-4">
              <span className="text-blue-500">สวัสดี👋 ผมคือ </span>
              <span className="text-white">LannaFinChat</span>
            </div>
            <p className="text-gray-400 text-lg">มีคำถามอะไรให้ช่วยตอบ เกี่ยวกับ ค่าใช้จ่ายในการเดินทาง หรือไหมครับ</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-3xl">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleQuestionClick(q)}
                  className="bg-gray-700 p-4 rounded-lg text-left hover:bg-gray-600"
                >
                  <p className="text-white font-semibold">{q}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start my-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-2xl ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 text-white mx-2">
                    {msg.sender === 'bot' ? <SmartToyIcon /> : <AccountCircleIcon />}
                  </div>
                  <div className={`p-4 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.text }} />
                    {msg.sender === 'bot' && msg.id && (
                      <FeedbackButtons
                        messageId={msg.id}
                        onDislikeClick={() => handleDislikeClick(msg.id!)}
                        onFeedbackSubmit={(type, comment, reason) =>
                          handleFeedbackSubmit(msg.id!, type, comment || '', reason || '')
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start my-4">
            <div className="flex items-start max-w-2xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 text-white mx-2">
                <SmartToyIcon />
              </div>
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
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

      <div className="p-4 bg-[#343541] border-t border-gray-700">
        <div className="relative max-w-3xl mx-auto bg-gray-700 rounded-lg">
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
            className="w-full bg-transparent p-4 pr-16 text-white placeholder-gray-400 focus:outline-none resize-none"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-500 disabled:text-gray-500"
            disabled={!userInput.trim() || isTyping}
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-xs text-center text-gray-500 mt-2">สร้างโดย AI เพื่อใช้ในการอ้างอิงเท่านั้น</p>
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
