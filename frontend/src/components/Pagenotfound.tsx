import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react';

const Pagenotfound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chat-bg via-neutral-900 to-chat-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="card p-12 shadow-2xl border border-neutral-700/50 backdrop-blur-sm max-w-md mx-auto">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-white mb-4">ไม่พบหน้าเว็บ</h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            หน้าที่คุณกำลังค้นหาอาจถูกลบ ย้าย หรือไม่มีอยู่จริง
          </p>

          {/* Action buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full btn-primary py-3 text-base font-semibold flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              กลับหน้าหลัก
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full btn-secondary py-3 text-base font-semibold flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              กลับไปหน้าก่อนหน้า
            </button>
          </div>

          {/* Decorative element */}
          <div className="mt-8 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-neutral-500 text-sm">LannaFinChat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagenotfound;
