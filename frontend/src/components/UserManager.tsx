import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/admin/users/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="กำลังโหลดข้อมูลผู้ใช้..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 ">
      <h1 className="text-2xl font-bold mb-4">ระบบจัดการผู้ใช้งาน</h1>
      <table className="min-w-full bg-white text-black ">
        <thead>
          <tr>
            <th className="py-2">รหัสผู้ใช้งาน</th>
            <th className="py-2">อีเมล</th>
            <th className="py-2">ชื่อผู้ใช้งาน</th>
            <th className="py-2">สิทธิ์</th> 
            <th className="py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2 flex justify-center">
                <button className="bg-blue-500 text-white px-2 py-1 rounded">เเก้ไข</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded ml-2">ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement; 