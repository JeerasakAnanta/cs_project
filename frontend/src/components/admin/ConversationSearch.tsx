import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, ThumbsUp, ThumbsDown, MessageSquare, User, Bot, Download } from 'lucide-react';
import { conversationService, Conversation, ConversationFilters } from '../../services/conversationService';

interface ConversationSearchProps {
  onConversationSelect?: (conversation: Conversation) => void;
}

const ConversationSearch: React.FC<ConversationSearchProps> = ({ onConversationSelect }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<ConversationFilters>({
    satisfaction: 'all',
    responseTime: 'all'
  });
  const [stats, setStats] = useState({
    totalConversations: 0,
    averageSatisfaction: 0,
    averageResponseTime: 0,
    satisfactionDistribution: { positive: 0, neutral: 0, negative: 0 }
  });

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await conversationService.getConversations();
      setConversations(data);
      setFilteredConversations(data);
      calculateStats(data);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const mockData: Conversation[] = [
      {
        id: '1',
        user_id: 'user1',
        username: 'john_doe',
        question: 'วิธีการใช้งานระบบ PDF อย่างไร?',
        bot_response: 'คุณสามารถอัปโหลดไฟล์ PDF และถามคำถามเกี่ยวกับเนื้อหาได้เลยครับ',
        satisfaction_rating: 5,
        response_time_ms: 1200,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:05Z'
      },
      {
        id: '2',
        user_id: 'user2',
        username: 'jane_smith',
        question: 'ระบบรองรับไฟล์อะไรบ้าง?',
        bot_response: 'ระบบรองรับไฟล์ PDF เท่านั้นครับ กรุณาแปลงไฟล์อื่นเป็น PDF ก่อน',
        satisfaction_rating: 4,
        response_time_ms: 800,
        created_at: '2024-01-15T11:15:00Z',
        updated_at: '2024-01-15T11:15:03Z'
      },
      {
        id: '3',
        user_id: 'user3',
        username: 'bob_wilson',
        question: 'ทำไมไม่สามารถอัปโหลดไฟล์ได้?',
        bot_response: 'กรุณาตรวจสอบขนาดไฟล์ไม่เกิน 10MB และเป็นไฟล์ PDF เท่านั้น',
        satisfaction_rating: 3,
        response_time_ms: 1500,
        created_at: '2024-01-15T14:20:00Z',
        updated_at: '2024-01-15T14:20:04Z'
      }
    ];
    
    setConversations(mockData);
    setFilteredConversations(mockData);
    calculateStats(mockData);
  };

  const calculateStats = (data: Conversation[]) => {
    const total = data.length;
    if (total === 0) {
      setStats({
        totalConversations: 0,
        averageSatisfaction: 0,
        averageResponseTime: 0,
        satisfactionDistribution: { positive: 0, neutral: 0, negative: 0 }
      });
      return;
    }

    const avgSatisfaction = data.reduce((sum, conv) => sum + (conv.satisfaction_rating || 0), 0) / total;
    const avgResponseTime = data.reduce((sum, conv) => sum + (conv.response_time_ms || 0), 0) / total;
    
    const satisfactionDist = {
      positive: data.filter(conv => (conv.satisfaction_rating || 0) >= 4).length,
      neutral: data.filter(conv => (conv.satisfaction_rating || 0) === 3).length,
      negative: data.filter(conv => (conv.satisfaction_rating || 0) <= 2).length
    };

    setStats({
      totalConversations: total,
      averageSatisfaction: Math.round(avgSatisfaction * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime),
      satisfactionDistribution: satisfactionDist
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterConversations(term, selectedFilters);
  };

  const handleFilterChange = (filterType: keyof ConversationFilters, value: string) => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);
    filterConversations(searchTerm, newFilters);
  };

  const filterConversations = (term: string, filters: ConversationFilters) => {
    let filtered = conversations;

    // Search filter
    if (term) {
      filtered = filtered.filter(conv =>
        conv.question.toLowerCase().includes(term.toLowerCase()) ||
        conv.bot_response.toLowerCase().includes(term.toLowerCase()) ||
        conv.username.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Satisfaction filter
    if (filters.satisfaction && filters.satisfaction !== 'all') {
      if (filters.satisfaction === 'positive') {
        filtered = filtered.filter(conv => (conv.satisfaction_rating || 0) >= 4);
      } else if (filters.satisfaction === 'neutral') {
        filtered = filtered.filter(conv => (conv.satisfaction_rating || 0) === 3);
      } else if (filters.satisfaction === 'negative') {
        filtered = filtered.filter(conv => (conv.satisfaction_rating || 0) <= 2);
      }
    }

    // Response time filter
    if (filters.responseTime && filters.responseTime !== 'all') {
      if (filters.responseTime === 'fast') {
        filtered = filtered.filter(conv => (conv.response_time_ms || 0) < 1000);
      } else if (filters.responseTime === 'medium') {
        filtered = filtered.filter(conv => (conv.response_time_ms || 0) >= 1000 && (conv.response_time_ms || 0) < 2000);
      } else if (filters.responseTime === 'slow') {
        filtered = filtered.filter(conv => (conv.response_time_ms || 0) >= 2000);
      }
    }

    setFilteredConversations(filtered);
  };

  const handleExport = async () => {
    try {
      const blob = await conversationService.exportConversations({
        search: searchTerm,
        ...selectedFilters
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting conversations:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล: ' + error.message);
    }
  };

  const getSatisfactionIcon = (rating: number) => {
    if (rating >= 4) return <ThumbsUp className="w-4 h-4 text-green-500" />;
    if (rating === 3) return <MessageSquare className="w-4 h-4 text-yellow-500" />;
    return <ThumbsDown className="w-4 h-4 text-red-500" />;
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 1000) return 'text-green-500';
    if (time < 2000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          ค้นหาและวิเคราะห์การสนทนา
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            ส่งออก CSV
          </button>
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">การสนทนาทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">ความพึงพอใจเฉลี่ย</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageSatisfaction}/5</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">เวลาตอบเฉลี่ย</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}ms</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            <span className="text-sm text-gray-600">ผู้ใช้ที่พึงพอใจ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.satisfactionDistribution.positive}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาคำถาม, คำตอบ, หรือชื่อผู้ใช้..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={selectedFilters.satisfaction || 'all'}
              onChange={(e) => handleFilterChange('satisfaction', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">ความพึงพอใจทั้งหมด</option>
              <option value="positive">พึงพอใจ (4-5)</option>
              <option value="neutral">ปานกลาง (3)</option>
              <option value="negative">ไม่พึงพอใจ (1-2)</option>
            </select>

            <select
              value={selectedFilters.responseTime || 'all'}
              onChange={(e) => handleFilterChange('responseTime', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">เวลาตอบทั้งหมด</option>
              <option value="fast">เร็ว (&lt;1s)</option>
              <option value="medium">ปานกลาง (1-2s)</option>
              <option value="slow">ช้า (&gt;2s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            รายการการสนทนา ({filteredConversations.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            ไม่พบการสนทนาที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onConversationSelect?.(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{conversation.username}</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(conversation.created_at)}
                      </span>
                    </div>

                    {/* Question */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">คำถาม:</span>
                      </div>
                      <p className="text-gray-800">{conversation.question}</p>
                    </div>

                    {/* Bot Response */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">คำตอบ:</span>
                      </div>
                      <p className="text-gray-800">{conversation.bot_response}</p>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {getSatisfactionIcon(conversation.satisfaction_rating || 0)}
                        <span className="text-gray-600">
                          ความพึงพอใจ: {conversation.satisfaction_rating || 'N/A'}/5
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className={`${getResponseTimeColor(conversation.response_time_ms || 0)}`}>
                          เวลาตอบ: {conversation.response_time_ms || 'N/A'}ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSearch;
