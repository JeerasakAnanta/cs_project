// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-rmutl-brown">Login</h1>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-rmutl-brown"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-white text-rmutl-brown border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rmutl-gold focus:border-rmutl-gold"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-rmutl-brown"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-white text-rmutl-brown border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rmutl-gold focus:border-rmutl-gold"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-rmutl-brown rounded-md hover:bg-rmutl-gold hover:text-rmutl-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rmutl-gold"
            >
              Login
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-rmutl-brown">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-rmutl-brown hover:text-rmutl-gold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
