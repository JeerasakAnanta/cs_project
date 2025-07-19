import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, User, Menu, X, Trash2, Shield, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const [isOpen, setIsOpen] = useState(true);
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
        onNewConversation();
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
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-800/80 backdrop-blur-sm rounded-lg border border-neutral-700/50 text-white hover:bg-neutral-700/80 transition-all duration-200 focus-ring"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-chat-sidebar w-80 h-full flex flex-col transition-all duration-300 ease-in-out border-r border-neutral-700/50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative fixed z-40 shadow-2xl`}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-700/50">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">LannaFinChat</h1>
          </div>
          <p className="text-center text-neutral-400 text-xs mt-2">AI Assistant สำหรับการเบิกจ่ายค่าใช้จ่าย</p>
        </div>

        {/* New conversation button */}
        <div className="p-4">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 focus-ring shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            แชทใหม่
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-4">
          {conversations.length > 0 ? (
            <>
              <p className="text-xs text-neutral-400 px-2 mb-3 font-medium">การสนทนาล่าสุด</p>
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentConversationId === conv.id 
                        ? 'bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30' 
                        : 'hover:bg-neutral-700/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <MessageSquare size={16} className="text-neutral-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-neutral-200 truncate font-medium">
                          {conv.title}
                        </span>
                      </div>
                      <button
                        data-id={conv.id}
                        onClick={handleDeleteConversation}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 transition-all duration-200 p-1 rounded hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={48} className="text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">ยังไม่มีการสนทนา</p>
              <p className="text-neutral-600 text-xs mt-1">เริ่มการสนทนาใหม่เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>

        {/* User section */}
        <div className="border-t border-neutral-700/50 p-4">
          <div className="space-y-2">
            {/* User profile */}
            <div className="flex items-center p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/30">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-200 truncate">
                  {currentUser?.username || 'ผู้ใช้'}
                </p>
                <p className="text-xs text-neutral-400">
                  {currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                </p>
              </div>
              {currentUser?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all duration-200 focus-ring"
                >
                  <Shield size={16} className="text-white" />
                </Link>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="w-full flex items-center p-3 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-left text-neutral-300 hover:text-red-400 transition-all duration-200 focus-ring"
            >
              <LogOut size={16} className="mr-3" />
              <span className="text-sm font-medium">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Navbar;