import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { marked } from 'marked';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

interface Message {
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
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error("Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [...prev, newConversation]);
        setCurrentConversationId(newConversation.id);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  const handleSelectConversation = async (id: number) => {
    setCurrentConversationId(id);
    try {
      const response = await fetch(`${BACKEND_API}/chat/conversations/${id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = await Promise.all(data.messages.map(async (msg: any) => {
          if (msg.sender === 'bot') {
            return { text: await formatBotMessage(msg.content), sender: 'bot' };
          }
          return { text: msg.content, sender: 'user' };
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching conversation details:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage: Message = { text: userInput, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setIsTyping(true);

    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        const response = await fetch(`${BACKEND_API}/chat/conversations/`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
          const newConversation = await response.json();
          setConversations(prev => [...prev, newConversation]);
          conversationId = newConversation.id;
          setCurrentConversationId(newConversation.id);
        }
      } catch (error) {
        console.error("Error creating new conversation:", error);
        setIsTyping(false);
        return;
      }
    }

    try {
      const response = await fetch(`${BACKEND_API}/chat/conversations/${conversationId}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ sender: 'user', content: userInput }),
      });
      if (response.ok) {
        const botMessageData = await response.json();
        const formattedText = await formatBotMessage(botMessageData.content);
        const botMessage: Message = { text: formattedText, sender: 'bot' };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const formatBotMessage = async (content: string): Promise<string> => {
    // This is a simplified parser. A more robust solution might be needed.
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
  }

  const handleDeleteConversation = async (id: number) => {
    try {
      await fetch(`${BACKEND_API}/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };


  const exampleQuestions = [
    'ค่าเบี้ยเดินทางใน ประเทศ',
    'ค่าใช้จ่ายในการฝึกอบรม จัดงาน',
    'ค่าใช้จ่ายในการประชุม',
    'ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ',
    'ค่าตอบแทนบุคคลหรือคณะกรรมการเกี่ยวกับการจัดซื้อจัดจ้างและบริหารพัสดุ',
    'ค่าใช้จ่ายในการบริหารงาน',
    'การจัดซื้อจัดจ้างที่มีความจำเป็นเร่งด่วน',
    'การจัดหาพัสดุที่เกี่ยวกับค่าใช้จ่ายในการบริหารงาน',
  ];

  return (
    <div className="relative h-full bg-white overflow-hidden flex">
      {/* Sidebar */}
      <aside className={`bg-rmutl-brown text-white p-4 flex flex-col w-80 transition-transform duration-300 ease-in-out z-20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute md:relative'}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">ประวัติการสนทนา</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white md:hidden">
            <ChevronLeftIcon />
          </button>
        </div>
        <button
          onClick={handleNewConversation}
          className="w-full bg-rmutl-gold text-rmutl-brown px-4 py-2 rounded-lg hover:bg-opacity-80 flex items-center justify-center mb-4"
        >
          <AddCommentIcon className="mr-2" />
          เริ่มการสนทนาใหม่
        </button>
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col space-y-2">
            {conversations.map(convo => (
              <div key={convo.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${currentConversationId === convo.id ? 'bg-rmutl-gold text-rmutl-brown' : 'hover:bg-gray-700'}`}>
                <span onClick={() => handleSelectConversation(convo.id)} className="flex-grow truncate">{convo.title}</span>
                <button onClick={() => handleDeleteConversation(convo.id)} className="text-gray-400 hover:text-white ml-2 flex-shrink-0">
                  <DeleteForeverIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-400 pt-4 border-t border-gray-700">
          <p>เวอร์ชัน 3.0.0 (DB History,login)</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-gray-100">
        <div className="flex-1 overflow-y-auto p-6" ref={chatBoxRef}>
          <div className="max-w-4xl mx-auto">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-4 left-4 z-30 text-white p-2 bg-rmutl-brown rounded-md hover:bg-rmutl-gold hover:text-black md:hidden"
              >
                <MenuIcon />
              </button>
            )}
            {messages.length === 0 && !isTyping ? (
              <div className="text-center text-gray-500">
                <SmartToyIcon style={{ fontSize: 60 }} className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-6">สวัสดีครับ, ให้ผมช่วยอะไร?</h2>
                <div className="grid grid-cols-2 gap-4">
                  {exampleQuestions.map((q, i) => (
                    <div key={i} onClick={() => setUserInput(q)} className="bg-white p-4 rounded-lg hover:bg-rmutl-gold hover:text-rmutl-brown cursor-pointer shadow-md">
                      <p className="font-semibold">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 my-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && <div className="p-2 bg-gray-300 rounded-full"><SmartToyIcon className="text-rmutl-brown" /></div>}
                  <div
                    className={`p-4 rounded-lg max-w-2xl shadow-md ${msg.sender === 'user' ? 'bg-rmutl-brown text-white' : 'bg-white text-gray-800'
                      }`}
                  >
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                  {msg.sender === 'user' && <div className="p-2 bg-rmutl-gold rounded-full"><AccountCircleIcon className="text-rmutl-brown" /></div>}
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex items-center justify-start gap-4 my-4">
                <div className="p-2 bg-gray-300 rounded-full"><SmartToyIcon className="text-rmutl-brown" /></div>
                <div className="p-4 rounded-lg max-w-2xl shadow-md bg-white text-gray-800">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center bg-gray-200 rounded-lg p-2">
              <input
                type="text"
                placeholder="พิมพ์ข้อความของคุณ..."
                className="flex-grow bg-transparent outline-none px-4 text-gray-800"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-full text-white bg-rmutl-brown hover:bg-rmutl-gold hover:text-black transition-colors"
                disabled={isTyping}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;