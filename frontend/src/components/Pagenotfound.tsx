import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react';

const Pagenotfound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="bg-white p-12 shadow-2xl border border-gray-200 backdrop-blur-sm max-w-md mx-auto rounded-xl">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบหน้าเว็บ</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            หน้าที่คุณกำลังค้นหาอาจถูกลบ ย้าย หรือไม่มีอยู่จริง
          </p>

          {/* Action buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold flex items-center justify-center rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              กลับหน้าหลัก
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 text-base font-semibold flex items-center justify-center rounded-lg transition-colors border border-gray-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              กลับไปหน้าก่อนหน้า
            </button>
          </div>

          {/* Decorative element */}
          <div className="mt-8 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-500 text-sm">LannaFinChat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagenotfound;
