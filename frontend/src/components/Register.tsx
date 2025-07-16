import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-rmutl-brown">Register</h1>
        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-rmutl-brown"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-white text-rmutl-brown border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rmutl-gold focus:border-rmutl-gold"
            />
          </div>
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
          {success && <p className="text-sm text-green-600">{success}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-rmutl-brown rounded-md hover:bg-rmutl-gold hover:text-rmutl-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rmutl-gold"
            >
              Register
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-rmutl-brown">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-rmutl-brown hover:text-rmutl-gold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 