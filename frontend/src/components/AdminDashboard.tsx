import React, { useState } from 'react';
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

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-5 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-10">แผงควบคุม</h1>
          <nav>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'pdf' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              จัดการไฟล์ PDF
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`w-full text-left px-4 py-2 mt-2 rounded-md ${activeTab === 'user' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              จัดการผู้ใช้งาน
            </button>
          </nav>
        </div>
        <nav>
            <a href="/" className="block w-full text-left px-4 py-2 mt-2 rounded-md hover:bg-gray-700">
              กลับไปหน้าแชท
            </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 bg-gray-900 text-white overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 