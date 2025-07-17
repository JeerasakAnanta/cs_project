import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${BACKEND_API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.status === 201) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json();

        // Check if errorData.detail is an array and format it
        let errorMsg = 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Extract messages from Pydantic validation errors
            errorMsg = errorData.detail.map((err: any) => err.msg || String(err)).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMsg = errorData.detail;
          } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
            errorMsg = JSON.stringify(errorData.detail);
          }
        }

        setError(errorMsg);
      }
    } catch (err: any) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">สมัครสมาชิก</h2>
        {error && (
          <pre className="bg-red-500 text-white p-3 rounded mb-4 whitespace-pre-wrap">
            {error}
          </pre>
        )}
        {success && <p className="bg-green-500 text-white p-3 rounded mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium" htmlFor="username">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium" htmlFor="email">
              อีเมล
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium" htmlFor="password">
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            สมัครสมาชิก
          </button>
        </form>
        <p className="text-center mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
