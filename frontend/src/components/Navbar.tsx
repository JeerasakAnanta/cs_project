import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, User, Menu, X, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth provides logout and user info

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;

interface Conversation {
  id: number;
  title: string;
}

const Navbar: React.FC<{
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onConversationDeleted: (id: number) => void;
  currentConversationId: number | null;
  conversations: { id: number; title: string }[];
}> = ({ onSelectConversation, onNewConversation, onConversationDeleted, currentConversationId, conversations }) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open on desktop
  const { currentUser, logout } = useAuth();
  const authToken = localStorage.getItem('authToken');

  const handleDeleteConversation: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id || '');
    if (isNaN(id)) return;

    try {
      await fetch(`${BACKEND_API}/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      onConversationDeleted(id);
      if (currentConversationId === id) {
        onNewConversation(); // Or select another conversation
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 text-white fixed top-2 left-2 z-50"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`bg-[#202123] w-64 h-full flex flex-col p-2 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative fixed z-40`}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-bold text-white text-center">LannaFinChat</span>
        </div>

        <button
          onClick={onNewConversation}
          className="flex items-center justify-center py-2 px-4 mb-4 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
        >
          <Plus size={20} className="mr-2" />
          แชทใหม่
        </button>

        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 px-2 mb-2">วันนี้</p>
          <ul>
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center text-white
                    ${currentConversationId === conv.id ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
                >
                  <span className="truncate">{conv.title}</span>
                  <button
                    data-id={conv.id}
                    onClick={handleDeleteConversation}
                    className="text-gray-400 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-700 pt-2">
          <div className="flex items-center p-2 rounded-md hover:bg-gray-700 cursor-pointer text-white">
            <User size={20} className="mr-3" />
            <span>{currentUser?.username || 'โปรไฟล์ของฉัน'}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center p-2 rounded-md hover:bg-gray-700 text-left text-white"
          >
            <LogOut size={20} className="mr-3" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;