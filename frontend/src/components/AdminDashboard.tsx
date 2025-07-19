import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  ArrowLeft, 
  Shield,
  Activity
} from 'lucide-react';
import PdfManager from './PdfManager';
import UserManager from './UserManager';

type AdminPage = 'dashboard' | 'knowledge' | 'users' | 'settings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pdf');

  const renderContent = () => {
    switch (activeTab) {
      case 'pdf':
        return <PdfManager />;
      case 'user':
        return <UserManager />;
      default:
        return <PdfManager />;
    }
  };

  const menuItems = [
    {
      id: 'pdf',
      label: 'จัดการไฟล์ PDF',
      icon: FileText,
      description: 'อัปโหลดและจัดการเอกสาร PDF'
    },
    {
      id: 'user',
      label: 'จัดการผู้ใช้งาน',
      icon: Users,
      description: 'ดูและจัดการบัญชีผู้ใช้'
    }
  ];

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
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 shadow-lg'
                      : 'hover:bg-neutral-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow'
                        : 'bg-neutral-700/50 group-hover:bg-neutral-600/50'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        activeTab === item.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        activeTab === item.id ? 'text-white' : 'text-neutral-300 group-hover:text-white'
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

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/30">
            <h3 className="text-sm font-medium text-neutral-300 mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              สถิติระบบ
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">ผู้ใช้ทั้งหมด</span>
                <span className="text-primary-400 font-medium">1,234</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">ไฟล์ PDF</span>
                <span className="text-purple-400 font-medium">567</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">การสนทนา</span>
                <span className="text-green-400 font-medium">8,901</span>
              </div>
            </div>
          </div>
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
                {activeTab === 'pdf' ? 'จัดการไฟล์ PDF' : 'จัดการผู้ใช้งาน'}
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                {activeTab === 'pdf' 
                  ? 'อัปโหลด จัดการ และควบคุมเอกสาร PDF ในระบบ' 
                  : 'ดูและจัดการบัญชีผู้ใช้ทั้งหมดในระบบ'
                }
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
    </div>
  );
};

export default AdminDashboard; 