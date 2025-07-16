import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        return;
      }
      const response = await axios.get('http://localhost:8000/admin/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Refresh the user list after deletion
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user.');
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">จัดการผู้ใช้งาน</h2>
      {error && <p className="text-red-500 bg-red-900 border border-red-700 p-2 rounded mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 border-b border-gray-600 text-left">ID</th>
              <th className="py-2 px-4 border-b border-gray-600 text-left">Username</th>
              <th className="py-2 px-4 border-b border-gray-600 text-left">Email</th>
              <th className="py-2 px-4 border-b border-gray-600 text-left">Role</th>
              <th className="py-2 px-4 border-b border-gray-600 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700">
                <td className="py-2 px-4 border-b border-gray-600">{user.id}</td>
                <td className="py-2 px-4 border-b border-gray-600">{user.username}</td>
                <td className="py-2 px-4 border-b border-gray-600">{user.email}</td>
                <td className="py-2 px-4 border-b border-gray-600">{user.role}</td>
                <td className="py-2 px-4 border-b border-gray-600">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager; 