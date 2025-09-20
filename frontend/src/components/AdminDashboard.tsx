import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  FileText,
  Users,
  ArrowLeft,
  Shield,
  BarChart3,
  MessageSquare,
  Search,
} from 'lucide-react';
import PDFManager from './pdf/PDFManager';
import UserManager from './admin/UserManager';
import SystemStatistics from './admin/SystemStatistics';
import ConversationSearch from './admin/ConversationSearch';
import ConversationAnalytics from './admin/ConversationAnalytics';
import ConversationDetail from './admin/ConversationDetail';

import { Conversation } from '../services/conversationService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const { theme } = useTheme();

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <SystemStatistics />;
      case 'conversations':
        return (
          <ConversationSearch onConversationSelect={handleConversationSelect} />
        );
      case 'analytics':
        return <ConversationAnalytics conversations={[]} />; // TODO: Pass real conversations data
      case 'admin':
        return (
          <div className="p-6 text-center">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              แผงควบคุมผู้ดูแลระบบ
            </h3>
            <p className="text-neutral-400">การตั้งค่าและควบคุมระบบโดยรวม</p>
          </div>
        );
      case 'user':
        return <UserManager />;
      case 'pdf':
        return <PDFManager />;
      default:
        return <SystemStatistics />;
    }
  };

  const menuItems = [
    {
      id: 'statistics',
      label: 'สถิติระบบ',
      icon: BarChart3,
      description: 'ดูสถิติระบบและการใช้งาน',
    },
    {
      id: 'conversations',
      label: 'ค้นหาการสนทนา',
      icon: Search,
      description: 'ค้นหาและดูรายละเอียดการสนทนา',
    },
    {
      id: 'analytics',
      label: 'วิเคราะห์การสนทนา',
      icon: MessageSquare,
      description: 'กราฟและสถิติการสนทนา',
    },

    {
      id: 'user',
      label: 'จัดการผู้ใช้งาน',
      icon: Users,
      description: 'ดูและจัดการบัญชีผู้ใช้',
    },
    {
      id: 'pdf',
      label: 'จัดการไฟล์ PDF',
      icon: FileText,
      description: 'อัปโหลดและจัดการเอกสาร PDF',
    },
    {
      id: 'admin',
      label: 'แผงควบคุมผู้ดูแลระบบ',
      icon: Shield,
      description: 'การตั้งค่าและควบคุมระบบ',
    },
  ];

  const getContentTitle = () => {
    switch (activeTab) {
      case 'statistics':
        return 'สถิติระบบ';
      case 'conversations':
        return 'ค้นหาการสนทนา';
      case 'analytics':
        return 'วิเคราะห์การสนทนา';
      case 'admin':
        return 'แผงควบคุมผู้ดูแลระบบ';
      case 'user':
        return 'จัดการผู้ใช้งาน';
      case 'pdf':
        return 'จัดการไฟล์ PDF';
      default:
        return 'สถิติระบบ';
    }
  };

  const getContentDescription = () => {
    switch (activeTab) {
      case 'statistics':
        return 'ดูสถิติการใช้งานระบบทั้งหมด รวมถึงผู้ใช้ การสนทนา และข้อความ';
      case 'conversations':
        return 'ค้นหา ดูรายละเอียด และวิเคราะห์การสนทนาระหว่างผู้ใช้และ Bot';
      case 'analytics':
        return 'ดูกราฟและสถิติการสนทนา ความพึงพอใจ และเวลาตอบสนอง';
      case 'admin':
        return 'การตั้งค่า ควบคุม และจัดการระบบโดยรวม';
      case 'user':
        return 'ดูและจัดการบัญชีผู้ใช้ทั้งหมดในระบบ';
      case 'pdf':
        return 'อัปโหลด จัดการ และควบคุมเอกสาร PDF ในระบบ';
      default:
        return 'ดูสถิติการใช้งานระบบทั้งหมด รวมถึงผู้ใช้ การสนทนา และข้อความ';
    }
  };

  return (
    <div
      className={`flex h-screen admin-panel ${theme === 'light' ? 'light-theme' : ''}`}
    >
      {/* Enhanced Sidebar */}
      <div
        className={`w-80 sidebar border-r flex flex-col shadow-2xl ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-chat-sidebar border-neutral-700/50'}`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b ${theme === 'light' ? 'border-gray-200' : 'border-neutral-700/50'}`}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'gradient-text'}`}
              >
                Admin Panel
              </h1>
              <p
                className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'}`}
              >
                แผงควบคุมผู้ดูแลระบบ
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group shadow-lg ${
                    activeTab === item.id
                      ? theme === 'light'
                        ? 'bg-blue-50 border border-blue-200 shadow-xl'
                        : 'bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 shadow-xl'
                      : theme === 'light'
                        ? 'hover:bg-gray-50 border border-transparent hover:shadow-md'
                        : 'hover:bg-neutral-700/50 border border-transparent hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                        activeTab === item.id
                          ? theme === 'light'
                            ? 'bg-blue-500 shadow-md'
                            : 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow'
                          : theme === 'light'
                            ? 'bg-gray-100 group-hover:bg-gray-200'
                            : 'bg-neutral-700/50 group-hover:bg-neutral-600/50'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          activeTab === item.id
                            ? 'text-white'
                            : theme === 'light'
                              ? 'text-gray-500 group-hover:text-gray-700'
                              : 'text-neutral-400 group-hover:text-neutral-300'
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          activeTab === item.id
                            ? theme === 'light'
                              ? 'text-blue-700'
                              : 'text-white'
                            : theme === 'light'
                              ? 'text-gray-700 group-hover:text-gray-900'
                              : 'text-neutral-300 group-hover:text-white'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === 'light'
                            ? 'text-gray-500 group-hover:text-gray-600'
                            : 'text-neutral-500 group-hover:text-neutral-400'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-neutral-700/50'}`}
        >
          <Link
            to="/"
            className={`w-full flex items-center p-3 rounded-lg border border-transparent text-left transition-all duration-200 focus-ring ${
              theme === 'light'
                ? 'hover:bg-gray-50 hover:border-gray-200 text-gray-700 hover:text-gray-900'
                : 'hover:bg-neutral-700/50 hover:border-neutral-600/50 text-neutral-300 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            <span className="font-medium">กลับไปหน้าแชท</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div
          className={`p-6 border-b backdrop-blur-sm ${
            theme === 'light'
              ? 'border-gray-200 bg-white/80'
              : 'border-neutral-700/50 bg-neutral-800/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}
              >
                {getContentTitle()}
              </h2>
              <p
                className={`text-sm mt-1 ${
                  theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                }`}
              >
                {getContentDescription()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span
                className={`text-xs ${
                  theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                }`}
              >
                ระบบออนไลน์
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          className={`flex-1 overflow-y-auto ${
            theme === 'light' ? 'bg-gray-50' : 'bg-chat-bg'
          }`}
        >
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <ConversationDetail
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
