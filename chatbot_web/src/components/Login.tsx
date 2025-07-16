// src/components/Login.tsx
import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios'; // Import AxiosResponse
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('game');
  const [password, setPassword] = useState('game');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response: AxiosResponse<{ access_token: string }> = await axios.post( // Specify the type here
        'http://localhost:8001/api/login',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token } = response.data;

      // ✅ Decode role from JWT
      const payloadBase64 = access_token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const role = decodedPayload.role;

      // ✅ Save token & role using AuthContext
      login(access_token, role);

      // ✅ Redirect based on role
      if (role === 'admin') {
        navigate('/adminPanel');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid login');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        className="border w-full p-2 mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border w-full p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
