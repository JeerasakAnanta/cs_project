// src/components/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, Lock, User, Sparkles } from 'lucide-react';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API || 'http://localhost:8001';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token);
        navigate('/');
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100' 
        : 'bg-gradient-to-br from-chat-bg via-neutral-900 to-chat-bg'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${
          theme === 'light' ? 'bg-blue-500/10' : 'bg-primary-500/10'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${
          theme === 'light' ? 'bg-purple-500/10' : 'bg-purple-500/10'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse-slow ${
          theme === 'light' ? 'bg-blue-500/5' : 'bg-blue-500/5'
        }`} style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className={`card p-8 shadow-2xl border backdrop-blur-sm ${
          theme === 'light' 
            ? 'bg-white/90 border-gray-200/30 shadow-blue-500/20' 
            : 'border-neutral-700/50'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${
                theme === 'light' 
                  ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700' 
                  : 'bg-gradient-to-br from-primary-500 to-purple-600'
              }`}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-3xl font-bold ${
                theme === 'light' ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent drop-shadow-sm' : 'gradient-text'
              }`}>LannaFinChat</h1>
            </div>
            <p className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
            }`}>เข้าสู่ระบบเพื่อเริ่มการสนทนา</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-neutral-300'
              }`} htmlFor="username">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${
                    theme === 'light' ? 'text-gray-500' : 'text-neutral-400'
                  }`} />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`input-field pl-10 ${
                    theme === 'light' 
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                      : 'bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400'
                  }`}
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-neutral-300'
              }`} htmlFor="password">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${
                    theme === 'light' ? 'text-gray-500' : 'text-neutral-400'
                  }`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field pl-10 pr-10 ${
                    theme === 'light' 
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                      : 'bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400'
                  }`}
                  placeholder="กรอกรหัสผ่าน"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'light' 
                      ? 'text-gray-500 hover:text-gray-700' 
                      : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'btn-primary'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>



          {/* Register link */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
            }`}>
              ยังไม่มีบัญชี?{' '}
              <Link 
                to="/register" 
                className={`font-medium transition-colors duration-200 hover:underline ${
                  theme === 'light' 
                    ? 'text-blue-600 hover:text-blue-700' 
                    : 'text-primary-400 hover:text-primary-300'
                }`}
              >
                สมัครสมาชิกที่นี่
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className={`text-xs ${
            theme === 'light' ? 'text-gray-500' : 'text-neutral-500'
          }`}>
            © 2025 LannaFinChat. Developed by CS RMUTL NAN. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
