import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { marked } from 'marked';

// import  vite env
const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

// debug console
console.log('Backend API  =', BACKEND_API);
console.log('Web Static web  =', DOCS_STATIC);

/**
 * Chatbot component
 *
 * @returns Chatbot component
 */
const Chatbot: React.FC = () => {
  // console.log(import.meta.env.HOST) // "123"

  /**
   * State to store user input
   */
  const [userInput, setUserInput] = useState<string>('');

  /**
   * State to store chatbot messages
   */
  const [messages, setMessages] = useState<
    Array<{ text: string; sender: 'user' | 'bot' }>
  >(JSON.parse(localStorage.getItem('chatbot-messages') || '[]'));

  /**
   * State to indicate if the chatbot is typing
   */
  const [isTyping, setIsTyping] = useState<boolean>(false);

  /**
   * Reference to the chat box element
   */
  const chatBoxRef = useRef<HTMLDivElement>(null);

  /**
   * Handle sending a message by the user
   */
  useEffect(() => {
    localStorage.setItem('chatbot-messages', JSON.stringify(messages));
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = {
      text: userInput,
      sender: 'user' as const,
    };

    // Optimistically updates the message on UI before waiting for response
    setMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await fetchChatbotResponse(userInput);
      const botMessage = {
        text: response,
        sender: 'bot' as const,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      const errorMessage = {
        text: 'เกิดข้อผิดพลาดในการติดต่อกับ chatbot.',
        sender: 'bot' as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Fetch chatbot response from the server
   *
   * @param input User input
   * @returns Chatbot response
   */

  const fetchChatbotResponse = async (input: string): Promise<string> => {
    const response = await fetch(`${BACKEND_API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: { message: string; source: string | null } =
      await response.json();
    const formattedMessage = formatChatbotMessage(data.message);
    if (data.source) {
      const sourceData = data.source.replace('./pdfs/', '');
      return `${formattedMessage}\n\n เอกสารอ้างอิง : <a href="${DOCS_STATIC}/file/${sourceData}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">${sourceData}</a>`;
    } else {
      return formattedMessage;
    }
  };

  /**
   * Format chatbot message using marked library
   *
   * @param message Chatbot message
   * @returns Formatted chatbot message
   */

  const formatChatbotMessage = (message: string): Promise<string> => {
    return marked(message) as Promise<string>;
  };

  /**
   * Clear chatbot history
   */
  const clearHistory = () => {
    fetch(`${BACKEND_API}/api/clear-history`, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: '',
    });
    setMessages([]);
    localStorage.removeItem('chatbot-messages');
  };

  /**
   * Set example question
   *
   * @param question Example question
   */
  const setExampleQuestion = (question: string) => {
    setUserInput(question);
  };

  return (
    <div className="mx-auto chat-container shadow-lg bg-white rounded-lg">
      <div className="flex justify-between mb-2">
        <p className="font-bold">
          ❗คำแนะนำ : Chatbots ตอบได้เฉพาะ "คู่มือปฏิบัติงาน
          การเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน" เท่านั้น
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white p-1  rounded-md"
          onClick={clearHistory}
        >
          <DeleteForeverIcon /> เริ่มเเชตใหม่
        </button>
      </div>

      <div
        ref={chatBoxRef}
        id="chat-box"
        className="chat-box border border-gray-300 rounded-lg p-4 mb-4 overflow-y-auto h-[calc(100vh-22rem)]"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div
              className={`chat-message ${msg.sender === 'bot' ? 'bg-amber-200' : 'bg-blue-500'} text-${msg.sender === 'bot' ? 'black' : 'white'} rounded-2xl p-2 max-w-3xl`}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator text-blue-500">
            กำลังค้นหาคำตอบ ในเอกสารคู่มือปฏิบัติงาน ค่ะ...
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-500 mt-2">
        LLMs can make mistakes. Verify important information.
      </p>

      <div className="flex items-center p-1">
        <div className="ml-2 mr-2">
          <KeyboardVoiceIcon />
        </div>
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-full"
          placeholder="พิมพ์ ถามเเชตบอต..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="ml-2 bg-amber-800 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl"
          onClick={handleSendMessage}
        >
          <SendIcon className="text-white mr-2 hover:text-white" />
          ส่ง
        </button>
      </div>

      <div className="text-center mt-2">
        <p className="text-gray-600 mb-2">ตัวอย่างคำถาม</p>
        <div className="flex flex-wrap justify-center ">
          {[
            'ค่าใช้จ่ายในการเดินทางไปราชการ',
            'ค่าใช้จ่ายในการฝึกอบรม จัดงาน',
            'ค่าใช้จ่ายในการประชุม',
            'ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ',
            'ค่าตอบแทนบุคคลหรือคณะกรรมการเกี่ยวกับการจัดซื้อจัดจ้างและบริหารพัสดุ',
            'ค่าใช้จ่ายในการบริหารงาน',
            'การจัดซื้อจัดจ้างที่มีความจำเป็นเร่งด่วน',
            'การจัดหาพัสดุที่เกี่ยวกับค่าใช้จ่ายในการบริหารงาน',
          ].map((question, index) => (
            <button
              key={index}
              className="bg-gray-200 text-gray-700 hover:bg-amber-800 hover:text-gray-50 px-3 py-1 rounded-lg mr-2 mb-2"
              onClick={() => setExampleQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
