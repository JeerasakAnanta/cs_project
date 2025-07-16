import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { marked } from 'marked';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

const Chatbot: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [messages, setMessages] = useState<
    Array<{ text: string; sender: 'user' | 'bot' }>
  >(JSON.parse(localStorage.getItem('chatbot-messages') || '[]'));
  const [isTyping, setIsTyping] = useState<boolean>(false);
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
        text: 'ขออภัย, เกิดข้อผิดพลาดบางอย่างในการสื่อสารกับบอท',
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
      return `${formattedMessage}\n\nอ้างอิง: <a href="${DOCS_STATIC}/file/${sourceData}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">${sourceData}</a>`;
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
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-4 flex flex-col">
        <div className="flex-grow">
          <h1 className="text-xl font-bold mb-4">ระบบถามตอบ</h1>
          <button
            onClick={clearHistory}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center"
          >
            <DeleteForeverIcon className="mr-2" />
            เริ่มการสนทนาใหม่
          </button>
        </div>
        <div className="text-xs text-gray-400">
          <p>เวอร์ชัน 1.0.0</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !isTyping ? (
              <div className="text-center">
                <SmartToyIcon style={{ fontSize: 60 }} className="text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-6">สวัสดีครับ, ให้ผมช่วยอะไร?</h2>
                <div className="grid grid-cols-2 gap-4">
                  {exampleQuestions.map((q, i) => (
                    <div key={i} onClick={() => setUserInput(q)} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 cursor-pointer">
                      <p className="font-semibold">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 my-6 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'bot' && <SmartToyIcon className="text-amber-400" style={{ fontSize: 32 }} />}
                  <div
                    className={`p-4 rounded-2xl max-w-2xl whitespace-pre-wrap prose prose-invert ${msg.sender === 'user'
                      ? 'bg-blue-600'
                      : 'bg-gray-700'
                      }`}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                  {msg.sender === 'user' && <AccountCircleIcon className="text-blue-300" style={{ fontSize: 32 }} />}
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex items-center gap-4 my-6">
                <SmartToyIcon className="text-amber-400" style={{ fontSize: 32 }} />
                <div className="bg-gray-700 p-4 rounded-2xl">
                  <p className="animate-pulse">กำลังพิมพ์...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gray-800">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                className="w-full bg-gray-700 border-none rounded-lg pl-4 pr-12 py-3 text-white focus:ring-2 focus:ring-amber-500"
                placeholder="พิมพ์คำถามของคุณที่นี่..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 text-white p-2 rounded-md hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              LLMs can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
