import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  ArrowLeft,
  Shield,
  BarChart3,
  MessageSquare,
  Search
} from 'lucide-react';
import PDFManager from './PDFManager';
import UserManager from './UserManager';
import SystemStatistics from './admin/SystemStatistics';
import ConversationSearch from './admin/ConversationSearch';
import ConversationAnalytics from './admin/ConversationAnalytics';
import ConversationDetail from './admin/ConversationDetail';

interface Conversation {
  id: string;
  user_id: string;
  username: string;
  question: string;
  bot_response: string;
  satisfaction_rating?: number;
  response_time_ms?: number;
  created_at: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <SystemStatistics />;
      case 'conversations':
        return <ConversationSearch onConversationSelect={setSelectedConversation} />;
      case 'analytics':
        return <ConversationAnalytics conversations={[]} />; // TODO: Pass real conversations data
      case 'admin':
        return <div className="p-6 text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">แผงควบคุมผู้ดูแลระบบ</h3>
          <p className="text-neutral-400">การตั้งค่าและควบคุมระบบโดยรวม</p>
        </div>;
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
      description: 'ดูสถิติระบบและการใช้งาน'
    },
    {
      id: 'conversations',
      label: 'ค้นหาการสนทนา',
      icon: Search,
      description: 'ค้นหาและดูรายละเอียดการสนทนา'
    },
    {
      id: 'analytics',
      label: 'วิเคราะห์การสนทนา',
      icon: MessageSquare,
      description: 'กราฟและสถิติการสนทนา'
    },

    {
      id: 'user',
      label: 'จัดการผู้ใช้งาน',
      icon: Users,
      description: 'ดูและจัดการบัญชีผู้ใช้'
    },
    {
      id: 'pdf',
      label: 'จัดการไฟล์ PDF',
      icon: FileText,
      description: 'อัปโหลดและจัดการเอกสาร PDF'
    },
    {
      id: 'admin',
      label: 'แผงควบคุมผู้ดูแลระบบ',
      icon: Shield,
      description: 'การตั้งค่าและควบคุมระบบ'
    }
  ];

  const getContentTitle = () => {
    switch (activeTab) {
      case 'statistics': return 'สถิติระบบ';
      case 'conversations': return 'ค้นหาการสนทนา';
      case 'analytics': return 'วิเคราะห์การสนทนา';
      case 'admin': return 'แผงควบคุมผู้ดูแลระบบ';
      case 'user': return 'จัดการผู้ใช้งาน';
      case 'pdf': return 'จัดการไฟล์ PDF';
      default: return 'สถิติระบบ';
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
    <div className="flex h-screen bg-chat-bg">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-chat-sidebar border-r border-neutral-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700/50">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
              <p className="text-neutral-400 text-xs">แผงควบคุมผู้ดูแลระบบ</p>
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
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${activeTab === item.id
                      ? 'bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 shadow-lg'
                      : 'hover:bg-neutral-700/50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${activeTab === item.id
                        ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow'
                        : 'bg-neutral-700/50 group-hover:bg-neutral-600/50'
                      }`}>
                      <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'
                        }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${activeTab === item.id ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                        }`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-neutral-500 group-hover:text-neutral-400">
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
        <div className="p-4 border-t border-neutral-700/50">
          <Link
            to="/"
            className="w-full flex items-center p-3 rounded-lg hover:bg-neutral-700/50 border border-transparent hover:border-neutral-600/50 text-left text-neutral-300 hover:text-white transition-all duration-200 focus-ring"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            <span className="font-medium">กลับไปหน้าแชท</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="p-6 border-b border-neutral-700/50 bg-neutral-800/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {getContentTitle()}
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                {getContentDescription()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-neutral-400">ระบบออนไลน์</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-chat-bg">
          <div className="p-6">
            {renderContent()}
          </div>
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