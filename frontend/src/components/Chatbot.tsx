import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import FeedbackButtons from './FeedbackButtons';
import FeedbackModal from './FeedbackModal';
import { Edit2, ThumbsDown, ThumbsUp } from 'lucide-react';

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
  const [userInput, setUserInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

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

    const originalUserInput = userInput;
    setUserInput('');
    setIsTyping(true);

    await onSendMessage(originalUserInput);

    setIsTyping(false);
  };

  const handleFeedbackSubmit = (
    messageId: number,
    feedbackType: 'like' | 'dislike',
    comment: string,
    reason: string
  ) => {
    // ... feedback logic
  };

  const handleDislikeClick = (messageId: number) => {
    setSelectedMessageId(messageId);
    setIsFeedbackModalOpen(true);
  };

  const handleExampleQuestionClick = (question: string) => {
    setUserInput(question);
  };

  const exampleQuestions = [
    'ตัวอย่างค่าเบี้ยเดินทางในประเทศ',
    'ค่าใช้จ่ายในการฝึกอบรม จัดงาน',
    'ค่าใช้จ่ายในการประชุม',
    'ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ',
  ];

  return (
    <div className="flex flex-col h-full bg-[#343541]">
      {/* Chat Header */}
      {currentConversation && (
        <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">{currentConversation.title}</h2>
        </div>
      )}

      {/* Chat Messages */}
      <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl font-bold mb-4">
              <span className="text-blue-500">สวัสดี, ฉันคือ </span>
              <span className="text-white">LannaFinChat</span>
            </div>
            <p className="text-gray-400 text-lg">มีอะไรให้ช่วยไหม?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-3xl">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleQuestionClick(q)}
                  className="bg-gray-700 p-4 rounded-lg text-left hover:bg-gray-600 transition-colors"
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 text-white flex-shrink-0 mx-2">
                    {msg.sender === 'bot' ? <SmartToyIcon /> : <AccountCircleIcon />}
                  </div>
                  <div className={`p-4 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.text }} />
                    {msg.sender === 'bot' && msg.id && (
                      <FeedbackButtons
                        messageId={msg.id}
                        onDislikeClick={() => handleDislikeClick(msg.id!)}
                        onFeedbackSubmit={(feedbackType, comment, reason) =>
                          handleFeedbackSubmit(msg.id!, feedbackType, comment || '', reason || '')
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
          <div className="flex justify-start p-6">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-white">กำลังพิมพ์...</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-[#343541] border-t border-gray-700 flex-shrink-0">
        <div className="relative max-w-3xl mx-auto bg-gray-700 rounded-lg">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
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
        <p className="text-xs text-center text-gray-500 mt-2">
          สร้างโดย AI เพื่อใช้ในการอ้างอิงเท่านั้น
        </p>
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