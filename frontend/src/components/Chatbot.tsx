import React, { useState, useEffect, useRef } from 'react';
import CustomAlert from './CustomAlert';
import { Sparkles, Send, Bot, User, MessageCircle, Zap } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900/70 via-purple-800/50 to-slate-900/70 relative">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-800/70 to-purple-800/60 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-white flex items-center gap-2 font-medium">
                  <MessageCircle className="w-4 h-4" />
                  {currentConversation ? currentConversation.title : 'New Conversation'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">AI Assistant v.1.0.0 </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area - with bottom padding to account for floating input */}
      <div className="flex-1 overflow-y-auto p-6 pb-32" ref={chatBoxRef}>
        <div className="max-w-5xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
                สวัสดียินดี ต้อนรับสู่ LannaFinChat
              </h2>
              <p className="text-white mb-12 max-w-lg mx-auto text-lg leading-relaxed font-medium">
                ผมพร้อมช่วยเหลือคุณในเรื่องการเงินและการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน 
              </p>

              {/* Example questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {[
                  'ขั้นตอนการเบิกค่าใช้จ่ายในการเดินทางไปราชการ',
                  'เอกสารที่ต้องใช้ในการเบิกค่าใช้จ่าย',
                  'ระยะเวลาการเบิกจ่ายค่าใช้จ่าย',
                  'การคำนวณค่าใช้จ่ายในการเดินทาง'
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuestionClick(question)}
                    className="group p-6 text-left bg-gradient-to-br from-slate-900/60 to-purple-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl hover:from-purple-800/70 hover:to-pink-800/60 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center group-hover:bg-neutral-600 transition-all duration-300">
                        <Sparkles className="w-4 h-4 text-purple-300" />
                      </div>
                      <div className="font-medium text-white group-hover:text-white transition-colors duration-300 leading-relaxed">
                        {question}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start max-w-4xl ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-4 ${msg.sender === 'user'
                        ? 'bg-blue-600 shadow-lg'
                        : 'bg-neutral-700 shadow-lg'
                        }`}>
                      {msg.sender === 'user' ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Bot className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Message content */}
                    <div className={`p-6 rounded-3xl max-w-3xl shadow-xl ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-neutral-800/80 backdrop-blur-xl border border-neutral-600 text-white'
                      }`}>
                      <div className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-white prose-a:text-blue-300" dangerouslySetInnerHTML={{ __html: msg.text }} />
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
        <div className="flex justify-start p-6 pb-32">
          <div className="flex items-start max-w-4xl">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-4 bg-neutral-700 shadow-lg animate-pulse">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-neutral-800/80 backdrop-blur-xl border border-neutral-600 p-6 rounded-3xl flex items-center shadow-xl">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Input area - positioned at bottom of viewport, below navbar */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-gradient-to-r from-slate-800/80 to-purple-800/70 backdrop-blur-xl border-t border-purple-500/20 shadow-2xl z-50 md:left-80">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-slate-900/80 to-purple-900/70 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/10">
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
              className="w-full bg-transparent p-4 pr-16 text-white focus:outline-none resize-none rounded-2xl text-base font-medium placeholder-white/70"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 focus:ring-4 focus:ring-neutral-500/25 shadow-lg"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-xs text-center text-white/80 mt-4 flex items-center justify-center gap-2 font-medium">
            <Sparkles className="w-3 h-3" />
            คำตอบสร้างโดย GenAI เพื่อใช้ในการค้นหาข้อมูลเท่านั้น โปรดตรวจสอบข้อมูลก่อนนำไปใช้งาน
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
