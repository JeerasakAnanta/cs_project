import React, { useState, useEffect, useRef } from 'react';
import CustomAlert from './CustomAlert';
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
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
  });
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

  const handleExampleQuestionClick = (text: string) => setUserInput(text);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="p-4 bg-neutral-800/30 bg-opacity-80 backdrop-blur-sm border-b border-neutral-700/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LannaFinChat</h1>
                <p className="text-sm text-neutral-400">
                  {currentConversation ? currentConversation.title : 'New Conversation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatBoxRef}>
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">ยินดีต้อนรับสู่ LannaFinChat</h2>
              <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                ผมพร้อมช่วยเหลือคุณในเรื่องการเงินและการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน
              </p>
              
              {/* Example questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  'ขั้นตอนการเบิกค่าใช้จ่ายในการเดินทางไปราชการ',
                  'เอกสารที่ต้องใช้ในการเบิกค่าใช้จ่าย',
                  'ระยะเวลาการเบิกจ่ายค่าใช้จ่าย',
                  'การคำนวณค่าใช้จ่ายในการเดินทาง'
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuestionClick(question)}
                    className="p-4 text-left bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 rounded-xl hover:bg-neutral-700/80 transition-colors text-neutral-300 hover:text-white"
                  >
                    <div className="font-medium">{question}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className="flex justify-start">
                  <div className="flex items-start max-w-3xl">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-3 bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow">
                      {msg.sender === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    {/* Message content */}
                    <div className={`p-4 rounded-2xl max-w-2xl ${msg.sender === 'user'
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 text-neutral-200'
                      }`}>
                      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.text }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

      {/* Input area */}
      <div className="p-3 bg-neutral-800/30 bg-opacity-80 backdrop-blur-sm border-t border-neutral-700/50 tr">
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
          <p className="text-xs text-center text-neutral-500 mt-2">
            สร้างโดย AI เพื่อใช้ในการอ้างอิงเท่านั้น
          </p>
        </div>
      </div>

      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Chatbot;
