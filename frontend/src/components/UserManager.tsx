import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  User,
  Mail,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API || 'http://localhost:8001';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/admin/users/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return;

    try {
      const response = await fetch(`${BACKEND_API}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('ไม่สามารถลบผู้ใช้ได้');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-gradient-to-r from-amber-500 to-orange-600', icon: Shield },
      user: { color: 'bg-gradient-to-r from-blue-500 to-purple-600', icon: User }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    const Icon = config.icon;
    
    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="กำลังโหลดข้อมูลผู้ใช้..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-neutral-400 mb-6">{error}</p>
        <button
          onClick={fetchUsers}
          className="btn-primary flex items-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-3 text-primary-400" />
            ระบบจัดการผู้ใช้งาน
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            จัดการบัญชีผู้ใช้ทั้งหมดในระบบ ({users.length} รายการ)
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          รีเฟรช
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field pl-10 appearance-none cursor-pointer"
            >
              <option value="all">ทุกสิทธิ์</option>
              <option value="admin">ผู้ดูแลระบบ</option>
              <option value="user">ผู้ใช้ทั่วไป</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-neutral-800 to-neutral-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  ผู้ใช้
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  สิทธิ์
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  รหัส
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-neutral-400 mr-2" />
                      <span className="text-sm text-neutral-300">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    #{user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-400 mb-2">ไม่พบผู้ใช้</h3>
            <p className="text-neutral-500 text-sm">
              {searchTerm || selectedRole !== 'all' 
                ? 'ลองเปลี่ยนเงื่อนไขการค้นหา' 
                : 'ยังไม่มีผู้ใช้ในระบบ'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 