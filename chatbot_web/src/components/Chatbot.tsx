import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { marked } from 'marked';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

const Chatbot: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [messages, setMessages] = useState<
    Array<{ text: string; sender: 'user' | 'bot' }>
  >(JSON.parse(localStorage.getItem('chatbot-messages') || '[]'));
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chatbot-messages', JSON.stringify(messages));
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const newMessage = { text: userInput, sender: 'user' as const };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await fetchChatbotResponse(userInput);
      const botMessage = { text: response, sender: 'bot' as const };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: 'เกิดข้อผิดพลาดในการติดต่อกับ chatbot.',
        sender: 'bot' as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchChatbotResponse = async (input: string): Promise<string> => {
    const response = await fetch(`${BACKEND_API}/api/chat/new_rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: { response: string; source: string | null } =
      await response.json();

    const formattedMessage = await marked.parse(data.response);
    if (data.source) {
      const sourceData = data.source.replace('./pdfs/', '');
      return `${formattedMessage}\n\nเอกสารอ้างอิง: <a href="${DOCS_STATIC}/file/${sourceData}" target="_blank" rel="noopener noreferrer" class="underline text-blue-600">${sourceData}</a>`;
    } else {
      return formattedMessage;
    }
  };

  const clearHistory = () => {
    fetch(`${BACKEND_API}/api/clear-history`, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: '',
    });
    setMessages([]);
    localStorage.removeItem('chatbot-messages');
  };

  const setExampleQuestion = (question: string) => {
    setUserInput(question);
  };

  const exampleQuestions = [
    'ค่าใช้จ่ายในการเดินทางไปราชการ',
    'ค่าใช้จ่ายในการฝึกอบรม จัดงาน',
    'ค่าใช้จ่ายในการประชุม',
    'ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ',
    'ค่าตอบแทนบุคคลหรือคณะกรรมการเกี่ยวกับการจัดซื้อจัดจ้างและบริหารพัสดุ',
    'ค่าใช้จ่ายในการบริหารงาน',
    'การจัดซื้อจัดจ้างที่มีความจำเป็นเร่งด่วน',
    'การจัดหาพัสดุที่เกี่ยวกับค่าใช้จ่ายในการบริหารงาน',
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-amber-900 text-white py-3 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white hover:bg-amber-800 p-1 rounded"
          >
            {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </button>
        </div>
        {/* <div className="text-lg font-semibold">ระบบตอบคำถามคู่มือราชการ</div> */}
        <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 bg-gray-100 p-4 border-r overflow-y-auto transition-all duration-300">
            <button
              onClick={clearHistory}
              className="bg-white text-amber-900 px-4 py-1 rounded shadow hover:bg-gray-100 flex items-center"
            >
              <DeleteForeverIcon className="inline mr-1" />
              เริ่มใหม่
            </button>
            <h2 className="text-md font-bold mb-4">📌 ตัวอย่างคำถาม</h2>
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setExampleQuestion(q)}
                className="block w-full text-left mb-2 px-3 py-2 bg-white rounded hover:bg-amber-800 hover:text-white transition"
              >
                {q}
              </button>
            ))}
          </aside>
        )}

        {/* Chat Area */}
        <main
          className={`flex-1 flex flex-col bg-white transition-all duration-300 ${isSidebarOpen ? '' : 'ml-0'}`}
        >
          {/* Chat Messages */}
          <div
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto p-8 space-y-4 flex flex-col items-center"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`w-full flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-3xl shadow max-w-xl whitespace-pre-wrap ${msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-amber-100 text-gray-900'
                    }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}
            {isTyping && (
              <div className="w-full flex justify-center">
                <p className="text-blue-500 animate-pulse">
                  กำลังค้นหาคำตอบจากเอกสาร...
                </p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4 flex items-center bg-white justify-center">
            <div className="w-full max-w-3xl flex items-center">
              <KeyboardVoiceIcon className="mr-2 text-gray-500" />
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-full px-4 py-2"
                placeholder="พิมพ์คำถามที่นี่..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 bg-amber-800 text-white px-4 py-2 rounded-full hover:bg-amber-600"
              >
                <SendIcon className="mr-1" />
                ส่ง
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-2 text-sm text-gray-500">
        LLMs can make mistakes. Verify important information.
      </footer>
    </div>
  );
};

export default Chatbot;
