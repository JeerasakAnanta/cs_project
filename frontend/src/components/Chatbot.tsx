import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { marked } from 'marked';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
    <div className="flex h-full bg-gray-800 text-white">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-900 p-4 flex flex-col">
        <div className="flex-grow">
          <h1 className="text-xl font-bold mb-4">ประวัติการสนทนา</h1>
          <button
            onClick={handleNewConversation}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center mb-4"
          >
            <AddCommentIcon className="mr-2" />
            เริ่มการสนทนาใหม่
          </button>
          <div className="flex flex-col space-y-2">
            {conversations.map(convo => (
              <div key={convo.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${currentConversationId === convo.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                <span onClick={() => handleSelectConversation(convo.id)} className="flex-grow">{convo.title}</span>
                <button onClick={() => handleDeleteConversation(convo.id)} className="text-gray-400 hover:text-white">
                  <DeleteForeverIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          <p>เวอร์ชัน 3.0.0 (DB History,login)</p>
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