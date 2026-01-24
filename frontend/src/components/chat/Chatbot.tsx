import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Bot,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CustomAlert from '../common/feedback/CustomAlert';
import TypingIndicator from '../common/ui/TypingIndicator';
import DocumentReferences from './DocumentReferences';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const BACKEND_API =
  import.meta.env.VITE_BACKEND_CHATBOT_API || 'http://localhost:8001';

interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}

interface Message {
  id?: number | string;
  text: string;
  sender: 'user' | 'bot';
  source_documents?: DocumentReference[];
}

interface ChatbotProps {
  currentConversationId: number | string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onSendMessage: (message: string) => Promise<void>;
  conversations: { id: number | string; title: string }[];
  isLoading?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({
  currentConversationId,
  messages,
  onSendMessage,
  conversations,
  isLoading = false,
}) => {
  const [userInput, setUserInput] = useState('');
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
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    messageId: number | null;
    feedbackType: 'like' | 'dislike' | null;
  }>({
    isOpen: false,
    messageId: null,
    feedbackType: null,
  });
  const [feedbackComment, setFeedbackComment] = useState('');
  const [currentConversationTitle, setCurrentConversationTitle] =
    useState<string>('');
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isGuestMode } = useAuth();
  const { theme } = useTheme();

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  // Configure marked for security and styling
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // Function to render markdown content safely
  const renderMarkdown = (content: string): string => {
    try {
      const htmlContent = marked.parse(content) as string;
      // Use DOMPurify for comprehensive XSS protection
      return DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'code', 
          'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 
          'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'target', 'class'],
        ALLOW_DATA_ATTR: false
      });
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return content; // Fallback to plain text
    }
  };

  const scrollToBottom =
    () => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when loading state changes (for typing indicator)
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Handle mobile keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const keyboardVisible = visualViewport.height < window.innerHeight * 0.75;
        if (keyboardVisible) {
          // Scroll to bottom when keyboard opens
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    };

    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleResize);
      return () => {
        if (visualViewport) {
          visualViewport.removeEventListener('resize', handleResize);
        }
      };
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [userInput]);

  useEffect(() => {
    if (currentConversation) {
      setCurrentConversationTitle(currentConversation.title);
    } else if (currentConversationId && messages.length > 0) {
      // If we have a conversation ID but no conversation object, use the first message as title
      const firstMessage = messages[0];
      if (firstMessage && firstMessage.sender === 'user') {
        const title =
          firstMessage.text.length > 50
            ? firstMessage.text.substring(0, 50) + '...'
            : firstMessage.text;
        setCurrentConversationTitle(title);
      }
    }
  }, [currentConversation, currentConversationId, messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const originalInput = userInput;
    setUserInput('');

    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    await onSendMessage(originalInput);
  };

  const handleExampleQuestionClick = (text: string) => {
    setUserInput(text);
    // Focus input and scroll to bottom
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom();
    }, 100);
  };

  const handleFeedback = (
    messageId: number,
    feedbackType: 'like' | 'dislike'
  ) => {
    setFeedbackModal({
      isOpen: true,
      messageId,
      feedbackType,
    });
  };

  const submitFeedback = async () => {
    if (!feedbackModal.messageId || !feedbackModal.feedbackType) return;

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setAlertState({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่พบ token การเข้าสู่ระบบ',
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API}/chat/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          message_id: feedbackModal.messageId,
          feedback_type: feedbackModal.feedbackType,
          comment: feedbackComment.trim() || null,
        }),
      });

      if (response.ok) {
        setAlertState({
          isOpen: true,
          type: 'success',
          title: 'ส่ง Feedback สำเร็จ',
          message: 'ขอบคุณสำหรับ feedback ของคุณ',
        });
        setFeedbackModal({
          isOpen: false,
          messageId: null,
          feedbackType: null,
        });
        setFeedbackComment('');
      } else {
        const errorData = await response.json();
        setAlertState({
          isOpen: true,
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: errorData.detail || 'ไม่สามารถส่ง feedback ได้',
        });
      }
    } catch (error) {
      setAlertState({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์',
      });
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, messageId: null, feedbackType: null });
    setFeedbackComment('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden safe-top safe-bottom">
      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 safe-top safe-bottom">
          <div className={`backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl border max-h-[90vh] overflow-y-auto ${
            theme === 'light'
              ? 'bg-white/95 border-gray-300/50'
              : 'bg-neutral-800/95 border-neutral-700/50'
          }`}>
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base sm:text-lg font-semibold ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    ให้ Feedback
                  </h3>
                  <button
                    onClick={closeFeedbackModal}
                    className={`p-2 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                      theme === 'light'
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <p className={`text-sm mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-neutral-300'
                  }`}>
                    คุณ
                    {feedbackModal.feedbackType === 'like' ? 'ชอบ' : 'ไม่ชอบ'}
                    คำตอบนี้หรือไม่?
                  </p>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="แสดงความคิดเห็นเพิ่มเติม (ไม่บังคับ)..."
                    className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none ${
                      theme === 'light'
                        ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                        : 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
                    }`}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={closeFeedbackModal}
                    className={`flex-1 font-medium py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-sm sm:text-base min-h-[44px] sm:min-h-0 ${
                      theme === 'light'
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    }`}
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={submitFeedback}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  >
                    ส่ง Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Header */}
      {currentConversationId && messages.length > 0 && (
        <div
          className={`border-b backdrop-blur-sm ${
            theme === 'light'
              ? 'border-gray-200 bg-gray-50/30'
              : 'border-neutral-700/50 bg-neutral-900/50'
          }`}
        >
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2
                    className={`text-base sm:text-lg font-semibold truncate ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {currentConversationTitle || 'การสนทนาใหม่'}
                  </h2>
                  <p
                    className={`text-xs sm:text-sm hidden sm:block ${
                      theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                    }`}
                  >
                    การสนทนาปัจจุบัน
                  </p>
                </div>
              </div>
              <div
                className={`text-xs sm:text-sm flex-shrink-0 ml-2 ${
                  theme === 'light' ? 'text-gray-500' : 'text-neutral-500'
                }`}
              >
                {messages.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat container - with proper flex layout */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-4 scroll-smooth -webkit-overflow-scrolling-touch"
        ref={chatBoxRef}
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Welcome message when no conversation */}
          {messages.length === 0 ? (
            <div className="text-center py-6 sm:py-12 px-2">
              <div className={`mb-6 sm:mb-8 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-sm border ${
                theme === 'light'
                  ? 'bg-white/80 border-gray-200/50'
                  : 'bg-neutral-800/80 border-neutral-700/50'
              }`}>
                <div
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl ${
                    theme === 'light'
                      ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700'
                      : 'bg-gradient-to-br from-primary-500 to-purple-600'
                  }`}
                >
                  <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2
                  className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent drop-shadow-sm'
                      : 'gradient-text'
                  }`}
                >
                  LannaFinChat
                </h2>
                <p
                  className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2 ${
                    theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                  }`}
                >
                  AI Assistant สำหรับการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน
                  เริ่มต้นการสนทนาโดยการถามคำถามหรือเลือกจากตัวอย่างด้านล่าง
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto px-2">
                {[
                  'ขั้นตอนการเบิกค่าใช้จ่ายในการเดินทางไปราชการ',
                  'เอกสารที่ต้องใช้ในการเบิกค่าใช้จ่าย',
                  'ระยะเวลาการเบิกจ่ายค่าใช้จ่าย',
                  'การคำนวณค่าใช้จ่ายในการเดินทาง',
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuestionClick(question)}
                    aria-label={`ถามคำถาม: ${question}`}
                    className={`group p-4 sm:p-6 text-left backdrop-blur-xl rounded-xl sm:rounded-2xl transition-all duration-300 transform active:scale-95 sm:hover:scale-105 hover:shadow-2xl touch-manipulation min-h-[44px] ${
                      theme === 'light'
                        ? 'bg-white/90 border border-blue-200/50 hover:bg-blue-50/90 hover:border-blue-300/70 hover:shadow-blue-500/30 shadow-lg'
                        : 'bg-gradient-to-br from-slate-900/60 to-purple-900/50 border border-purple-500/30 hover:from-purple-800/70 hover:to-pink-800/60 hover:border-purple-400/50 hover:shadow-purple-500/20 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                          theme === 'light'
                            ? 'bg-blue-100 group-hover:bg-blue-200'
                            : 'bg-neutral-700 group-hover:bg-neutral-600'
                        }`}
                      >
                        <Sparkles
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            theme === 'light'
                              ? 'text-blue-600'
                              : 'text-purple-300'
                          }`}
                        />
                      </div>
                      <div
                        className={`text-sm sm:text-base font-medium transition-colors duration-300 leading-relaxed ${
                          theme === 'light'
                            ? 'text-gray-900 group-hover:text-gray-900'
                            : 'text-white group-hover:text-white'
                        }`}
                      >
                        {question}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${index === messages.length - 1 ? 'mb-4' : ''} px-1`}
                >
                  <div
                    className={`flex items-start max-w-[95%] sm:max-w-[90%] md:max-w-4xl ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mx-1 sm:mx-3 md:mx-4 flex-shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 shadow-lg'
                          : 'bg-neutral-700 shadow-lg'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      )}
                    </div>

                    {/* Message content */}
                    <div
                      className={`p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl max-w-full shadow-2xl ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : theme === 'light'
                            ? 'bg-white backdrop-blur-xl border border-gray-200 text-black shadow-lg'
                            : 'bg-neutral-800/80 backdrop-blur-xl border border-neutral-600 text-white shadow-lg'
                      }`}
                    >
                      <div
                        className={`prose prose-sm sm:prose-base max-w-none ${
                          theme === 'light'
                            ? 'prose-p:text-black prose-p:font-medium prose-strong:text-black prose-strong:font-bold prose-em:text-black prose-em:font-medium prose-a:text-blue-700 prose-a:font-medium prose-headings:text-black prose-headings:font-bold prose-h1:text-black prose-h1:font-bold prose-h2:text-black prose-h2:font-bold prose-h3:text-black prose-h3:font-bold prose-h4:text-black prose-h4:font-bold prose-h5:text-black prose-h5:font-bold prose-h6:text-black prose-h6:font-bold prose-code:text-blue-700 prose-code:font-semibold prose-pre:bg-gray-50 prose-pre:text-black prose-pre:font-medium prose-pre:border-gray-200 prose-blockquote:border-l-blue-600 prose-blockquote:text-gray-800 prose-blockquote:font-medium prose-ul:text-black prose-ul:font-medium prose-ol:text-black prose-ol:font-medium prose-li:text-black prose-li:font-medium prose-table:text-black prose-table:font-medium prose-th:text-black prose-th:font-bold prose-td:text-black prose-td:font-medium prose-img:border-gray-200'
                            : 'prose-invert prose-p:text-white prose-p:font-medium prose-strong:text-white prose-strong:font-bold prose-em:text-white prose-em:font-medium prose-a:text-blue-300 prose-a:font-medium prose-headings:text-white prose-headings:font-bold prose-h1:text-white prose-h1:font-bold prose-h2:text-white prose-h2:font-bold prose-h3:text-white prose-h3:font-bold prose-h4:text-white prose-h4:font-bold prose-h5:text-white prose-h5:font-bold prose-h6:text-white prose-h6:font-bold prose-code:text-primary-300 prose-code:font-semibold prose-pre:bg-neutral-800 prose-pre:text-white prose-pre:font-medium prose-pre:border-neutral-700 prose-blockquote:border-l-primary-500 prose-blockquote:text-neutral-300 prose-blockquote:font-medium prose-ul:text-white prose-ul:font-medium prose-ol:text-white prose-ol:font-medium prose-li:text-white prose-li:font-medium prose-table:text-white prose-table:font-medium prose-th:text-white prose-th:font-bold prose-td:text-white prose-td:font-medium prose-img:border-neutral-700'
                        }`}
                        dangerouslySetInnerHTML={{
                          __html:
                            msg.sender === 'bot'
                              ? renderMarkdown(msg.text)
                              : msg.text,
                        }}
                      />

                      {/* Document References for bot messages */}
                      {msg.sender === 'bot' && msg.source_documents && msg.source_documents.length > 0 && (
                        <DocumentReferences 
                          references={msg.source_documents}
                          className="mt-4"
                        />
                      )}

                      {/* Feedback buttons for bot messages - only for authenticated users */}
                      {msg.sender === 'bot' &&
                        msg.id &&
                        typeof msg.id === 'number' &&
                        !isGuestMode() && (
                          <div
                            className={`flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${
                              theme === 'light'
                                ? 'border-gray-300/50'
                                : 'border-neutral-600/50'
                            }`}
                          >
                            <button
                              onClick={() =>
                                handleFeedback(msg.id as number, 'like')
                              }
                              aria-label="ชอบคำตอบนี้"
                              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-1.5 bg-green-600/20 hover:bg-green-600/30 active:bg-green-600/40 border border-green-500/30 hover:border-green-500/50 rounded-lg text-green-400 hover:text-green-300 transition-all duration-200 text-xs sm:text-sm min-h-[44px] sm:min-h-0 touch-manipulation active:scale-95"
                            >
                              <ThumbsUp className="w-4 h-4 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">ชอบ</span>
                            </button>
                            <button
                              onClick={() =>
                                handleFeedback(msg.id as number, 'dislike')
                              }
                              aria-label="ไม่ชอบคำตอบนี้"
                              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-1.5 bg-red-600/20 hover:bg-red-600/30 active:bg-red-600/40 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 text-xs sm:text-sm min-h-[44px] sm:min-h-0 touch-manipulation active:scale-95"
                            >
                              <ThumbsDown className="w-4 h-4 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">ไม่ชอบ</span>
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Typing indicator */}
      {isLoading && (
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 max-w-4xl mx-auto">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center ${
                theme === 'light' ? 'bg-gray-200' : 'bg-neutral-700'
              }`}
            >
              <Bot
                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                  theme === 'light' ? 'text-gray-700' : 'text-white'
                }`}
              />
            </div>
            <div
              className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-xl border ${
                theme === 'light'
                  ? 'bg-gray-100/80 border-gray-300'
                  : 'bg-neutral-800/80 border-neutral-600'
              }`}
            >
              <TypingIndicator variant="dots" size="medium" />
            </div>
          </div>
        </div>
      )}

      {/* Input area at bottom - sticky positioning */}
      <div
        className={`sticky bottom-0 p-2 sm:p-3 border-t backdrop-blur-xl shadow-2xl z-10 safe-bottom ${
          theme === 'light'
            ? 'border-gray-200 bg-white/95'
            : 'border-neutral-700/50 bg-neutral-900/95'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div
            className={`relative backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl ${
              theme === 'light'
                ? 'bg-white/90 border border-blue-200/50 shadow-blue-500/30'
                : 'bg-gradient-to-br from-slate-900/80 to-purple-900/70 border border-purple-500/30 shadow-purple-500/20'
            }`}
          >
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onFocus={() => {
                // Scroll to bottom when input is focused
                setTimeout(() => scrollToBottom(), 300);
              }}
              placeholder="ส่งข้อความถึง LannaFinChat..."
              aria-label="พิมพ์ข้อความ"
              className={`w-full bg-transparent p-3 sm:p-4 pr-12 sm:pr-16 focus:outline-none resize-none rounded-2xl font-medium ${
                theme === 'light'
                  ? 'text-gray-900 placeholder-gray-500/70'
                  : 'text-white placeholder-white/70'
              }`}
              rows={1}
              style={{ 
                minHeight: '48px',
                maxHeight: '120px',
                fontSize: '16px', // Prevents zoom on iOS
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isLoading}
              aria-label="ส่งข้อความ"
              className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-2 rounded-xl transition-all duration-300 transform active:scale-90 sm:hover:scale-110 focus:ring-4 shadow-lg min-w-[48px] min-h-[48px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation ${
                theme === 'light'
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 focus:ring-blue-400/25'
                  : 'bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 disabled:bg-neutral-800 focus:ring-neutral-500/25'
              } disabled:cursor-not-allowed disabled:active:scale-100`}
            >
              <Send className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
          <p
            className={`text-xs text-center mt-2 sm:mt-3 flex items-center justify-center gap-1 sm:gap-2 font-medium px-2 ${
              theme === 'light' ? 'text-gray-600/80' : 'text-white/80'
            }`}
          >
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">คำตอบสร้างโดย GenAI เพื่อใช้ในการค้นหาข้อมูลเท่านั้น โปรดตรวจสอบข้อมูลก่อนนำไปใช้งาน</span>
            <span className="sm:hidden">คำตอบสร้างโดย GenAI โปรดตรวจสอบข้อมูลก่อนใช้งาน</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
