import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  LogIn,
  User,
  Menu,
  X,
  Trash2,
  Shield,
  MessageSquare,
  MessageCirclePlus,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const BACKEND_API =
  import.meta.env.VITE_BACKEND_CHATBOT_API || 'http://localhost:8001';

const Navbar: React.FC<{
  onSelectConversation: (id: number | string) => void;
  onNewConversation: () => void;
  onConversationDeleted: (id: number | string) => void;
  currentConversationId: number | string | null;
  conversations: { id: number | string; title: string }[];
}> = ({
  onSelectConversation,
  onNewConversation,
  onConversationDeleted,
  currentConversationId,
  conversations,
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const { currentUser, logout, isGuestMode } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const authToken = localStorage.getItem('authToken');

    const handleDeleteConversation: React.MouseEventHandler<
      HTMLButtonElement
    > = async (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id || '';
      if (!id) return;

      if (isGuestMode()) {
        // For guest mode, just call the callback (localStorage deletion is handled in App.tsx)
        onConversationDeleted(id);
        if (currentConversationId === id) {
          onNewConversation();
        }
      } else {
        // For authenticated users, delete from backend
        const numericId = parseInt(id);
        if (isNaN(numericId)) return;

        try {
          const response = await fetch(
            `${BACKEND_API}/chat/conversations/${numericId}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          if (response.ok) {
            onConversationDeleted(numericId);
            if (currentConversationId === numericId) {
              onNewConversation();
            }
          } else if (response.status === 401) {
            // Token is invalid or expired, clear it and redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            return;
          } else {
            console.error(
              'Error deleting conversation:',
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error('Error deleting conversation:', error);
        }
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
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all duration-200 focus-ring shadow-lg"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar */}
        <div
          className={`bg-white w-80 h-full flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:relative fixed z-40 shadow-2xl`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent drop-shadow-sm">
                LannaFinChat
              </h1>
            </div>
            <p className="text-center text-gray-600 text-xs mt-2">
              AI Assistant สำหรับการเบิกจ่ายค่าใช้จ่าย
            </p>
          </div>

          {/* New conversation button */}
          <div className="p-4">
            <button
              onClick={onNewConversation}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 focus-ring shadow-xl hover:shadow-2xl"
            >
              <MessageCirclePlus size={18} className="mr-2" />
              แชทใหม่
            </button>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto px-4">
            {conversations.length > 0 ? (
              <>
                <p className="text-xs text-gray-600 px-2 mb-3 font-medium">
                  การสนทนาล่าสุด
                </p>
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${currentConversationId === conv.id
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300'
                          : 'hover:bg-sky-100 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <MessageSquare
                            size={16}
                            className="text-gray-500 mr-2 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-700 truncate font-medium">
                            {conv.title}
                          </span>
                        </div>
                        <button
                          data-id={conv.id}
                          onClick={handleDeleteConversation}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all duration-200 p-1 rounded hover:bg-red-50"
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
                <MessageSquare size={48} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">ยังไม่มีการสนทนา</p>
                <p className="text-gray-500 text-xs mt-1">
                  เริ่มการสนทนาใหม่เพื่อเริ่มต้น
                </p>
              </div>
            )}
          </div>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2">
              {/* User profile */}
              <div className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <User size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {currentUser?.username ||
                      (isGuestMode() ? 'ผู้เยี่ยมชม' : 'ผู้ใช้')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.role === 'admin'
                      ? 'ผู้ดูแลระบบ'
                      : isGuestMode()
                        ? 'โหมดผู้เยี่ยมชม'
                        : 'ผู้ใช้ทั่วไป'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all duration-200 focus-ring"
                    >
                      <Shield size={16} className="text-white" />
                    </Link>
                  )}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 hover:text-blue-600 transition-all duration-200 focus-ring"
                    title="ธีมสว่าง (ใช้งานอยู่)"
                  >
                    <Sun size={16} />
                  </button>
                </div>
              </div>

              {/* Login/Logout button */}
              {isGuestMode() ? (
                <Link
                  to="/login"
                  className="w-full flex items-center p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 text-left text-gray-600 hover:text-blue-600 transition-all duration-200 focus-ring"
                >
                  <LogIn size={16} className="mr-3" />
                  <span className="text-sm font-medium">เข้าสู่ระบบ</span>
                </Link>
              ) : (
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 text-left text-gray-600 hover:text-red-600 transition-all duration-200 focus-ring"
                >
                  <LogOut size={16} className="mr-3" />
                  <span className="text-sm font-medium">ออกจากระบบ</span>
                </button>
              )}
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
