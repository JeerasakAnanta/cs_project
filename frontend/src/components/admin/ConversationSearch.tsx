import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  Bot,
  Download,
} from 'lucide-react';
import {
  conversationService,
  Conversation,
  ConversationFilters,
} from '../../services/conversationService';
import { marked } from 'marked';
import './ConversationSearch.css';

interface ConversationSearchProps {
  onConversationSelect?: (conversation: Conversation) => void;
}

const ConversationSearch: React.FC<ConversationSearchProps> = ({
  onConversationSelect,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<ConversationFilters>({
    satisfaction: 'all',
    responseTime: 'all',
  });
  const [stats, setStats] = useState({
    totalConversations: 0,
    averageSatisfaction: 0,
    averageResponseTime: 0,
    satisfactionDistribution: { positive: 0, neutral: 0, negative: 0 },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(
    new Set()
  );

  const calculateStats = useCallback((data: Conversation[]) => {
    const total = data.length;
    if (total === 0) {
      setStats({
        totalConversations: 0,
        averageSatisfaction: 0,
        averageResponseTime: 0,
        satisfactionDistribution: { positive: 0, neutral: 0, negative: 0 },
      });
      return;
    }

    const avgSatisfaction =
      data.reduce((sum, conv) => sum + (conv.satisfaction_rating || 0), 0) /
      total;
    const avgResponseTime =
      data.reduce((sum, conv) => sum + (conv.response_time_ms || 0), 0) / total;

    const satisfactionDist = {
      positive: data.filter((conv) => (conv.satisfaction_rating || 0) >= 4)
        .length,
      neutral: data.filter((conv) => (conv.satisfaction_rating || 0) === 3)
        .length,
      negative: data.filter((conv) => (conv.satisfaction_rating || 0) <= 2)
        .length,
    };

    setStats({
      totalConversations: total,
      averageSatisfaction: Math.round(avgSatisfaction * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime),
      satisfactionDistribution: satisfactionDist,
    });
  }, []);

  const loadMockData = useCallback(() => {
    const mockData: Conversation[] = [
      {
        id: 1,
        user_id: 1,
        username: 'john_doe',
        question: 'วิธีการใช้งานระบบ PDF อย่างไร?',
        bot_response:
          'คุณสามารถอัปโหลดไฟล์ PDF และถามคำถามเกี่ยวกับเนื้อหาได้เลยครับ',
        satisfaction_rating: 5,
        response_time_ms: 1200,
        conversation_type: 'regular',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:05Z',
      },
      {
        id: 2,
        user_id: 2,
        username: 'jane_smith',
        question: 'ระบบรองรับไฟล์อะไรบ้าง?',
        bot_response:
          'ระบบรองรับไฟล์ PDF เท่านั้นครับ กรุณาแปลงไฟล์อื่นเป็น PDF ก่อน',
        satisfaction_rating: 4,
        response_time_ms: 800,
        conversation_type: 'regular',
        created_at: '2024-01-15T11:15:00Z',
        updated_at: '2024-01-15T11:15:03Z',
      },
      {
        id: 3,
        user_id: 3,
        username: 'bob_wilson',
        question: 'ทำไมไม่สามารถอัปโหลดไฟล์ได้?',
        bot_response:
          'กรุณาตรวจสอบขนาดไฟล์ไม่เกิน 10MB และเป็นไฟล์ PDF เท่านั้น',
        satisfaction_rating: 3,
        response_time_ms: 1500,
        conversation_type: 'regular',
        created_at: '2024-01-15T14:20:00Z',
        updated_at: '2024-01-15T14:20:04Z',
      },
    ];

    setConversations(mockData);
    setFilteredConversations(mockData);
    calculateStats(mockData);
  }, [calculateStats]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await conversationService.getConversations();
      console.log('Loaded conversations:', data); // Debug log
      setConversations(data);
      setFilteredConversations(data);
      calculateStats(data);
    } catch (error: unknown) {
      console.error('Error loading conversations:', error);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats, loadMockData]);

  useEffect(() => {
    loadConversations();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadConversations]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterConversations(term, selectedFilters);
  };

  const handleFilterChange = (
    filterType: keyof ConversationFilters,
    value: string
  ) => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);
    filterConversations(searchTerm, newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredConversations.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Function to toggle expanded response
  const toggleExpandedResponse = (conversationId: string) => {
    setExpandedResponses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const filterConversations = (term: string, filters: ConversationFilters) => {
    let filtered = conversations;

    // Search filter
    if (term) {
      filtered = filtered.filter(
        (conv) =>
          conv.question.toLowerCase().includes(term.toLowerCase()) ||
          conv.bot_response.toLowerCase().includes(term.toLowerCase()) ||
          conv.username.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Satisfaction filter
    if (filters.satisfaction && filters.satisfaction !== 'all') {
      if (filters.satisfaction === 'positive') {
        filtered = filtered.filter(
          (conv) => (conv.satisfaction_rating || 0) >= 4
        );
      } else if (filters.satisfaction === 'neutral') {
        filtered = filtered.filter(
          (conv) => (conv.satisfaction_rating || 0) === 3
        );
      } else if (filters.satisfaction === 'negative') {
        filtered = filtered.filter(
          (conv) => (conv.satisfaction_rating || 0) <= 2
        );
      }
    }

    // Response time filter
    if (filters.responseTime && filters.responseTime !== 'all') {
      if (filters.responseTime === 'fast') {
        filtered = filtered.filter(
          (conv) => (conv.response_time_ms || 0) <= 1000
        );
      } else if (filters.responseTime === 'medium') {
        filtered = filtered.filter(
          (conv) =>
            (conv.response_time_ms || 0) > 1000 &&
            (conv.response_time_ms || 0) <= 2000
        );
      } else if (filters.responseTime === 'slow') {
        filtered = filtered.filter(
          (conv) => (conv.response_time_ms || 0) >= 3000
        );
      }
    }

    setFilteredConversations(filtered);
  };

  const handleExport = async () => {
    try {
      const blob = await conversationService.exportConversations({
        search: searchTerm,
        ...selectedFilters,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: unknown) {
      console.error('Error exporting conversations:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล: ' + message);
    }
  };

  const getSatisfactionIcon = (rating: number) => {
    if (rating >= 4) return <ThumbsUp className="w-4 h-4 text-green-500" />;
    if (rating === 3)
      return <MessageSquare className="w-4 h-4 text-yellow-500" />;
    return <ThumbsDown className="w-4 h-4 text-red-500" />;
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 1000) return 'text-green-500';
    if (time <= 2000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  // Function to truncate text to approximately 4 lines
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return { text: text, isTruncated: false };
    return { text: text.substring(0, maxLength) + '...', isTruncated: true };
  };

  // Function to render markdown safely
  const renderMarkdown = (text: string) => {
    try {
      return marked.parse(text) as string;
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return text; // Fallback to plain text
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-400" />
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
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-rose-200/70 to-pink-200/70 border border-rose-400/50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-800 font-medium">
              การสนทนาทั้งหมด
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalConversations}
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-200/70 to-purple-200/70 border border-violet-400/50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-800 font-medium">
              ความพึงพอใจเฉลี่ย
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.averageSatisfaction}/5
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-200/70 to-cyan-200/70 border border-blue-400/50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-800 font-medium">
              เวลาตอบเฉลี่ย
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.averageResponseTime}ms
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-200/70 to-teal-200/70 border border-cyan-400/50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-700" />
            <span className="text-sm text-gray-800 font-medium">
              ผู้ใช้ที่พึงพอใจ
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.satisfactionDistribution.positive}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-emerald-200/70 to-green-200/70 border border-emerald-400/50 p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาคำถาม, คำตอบ, หรือชื่อผู้ใช้..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-emerald-500/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={selectedFilters.satisfaction || 'all'}
              onChange={(e) =>
                handleFilterChange('satisfaction', e.target.value)
              }
              className="px-3 py-2 bg-white/80 border border-gray-400/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 shadow-sm"
            >
              <option value="all">ความพึงพอใจทั้งหมด</option>
              <option value="positive">พึงพอใจ (4-5)</option>
              <option value="neutral">ปานกลาง (3)</option>
              <option value="negative">ไม่พึงพอใจ (1-2)</option>
            </select>

            <select
              value={selectedFilters.responseTime || 'all'}
              onChange={(e) =>
                handleFilterChange('responseTime', e.target.value)
              }
              className="px-3 py-2 bg-white/80 border border-gray-400/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 shadow-sm"
            >
              <option value="all">เวลาตอบทั้งหมด</option>
              <option value="fast">เร็วมาก (≤1s) 🟢</option>
              <option value="medium">เร็ว (1-2s) 🟡</option>
              <option value="slow">ช้า (≥3s) 🔴</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-gradient-to-br from-slate-200/70 to-gray-200/70 border border-slate-300/60 rounded-xl shadow-md">
        <div className="p-4 border-b border-gray-300/60">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              รายการการสนทนา ({filteredConversations.length}) - แสดง 10
              รายการต่อหน้า
            </h3>
            <div className="text-xs text-gray-600">
              อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-black">
            ไม่พบการสนทนาที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div className="space-y-2">
            {getCurrentPageData().map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 hover:bg-white/60 cursor-pointer transition-all duration-200 border border-gray-200/60 rounded-lg m-2 shadow-sm hover:shadow-md"
                onClick={() => onConversationSelect?.(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {conversation.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(conversation.created_at)}
                      </span>
                    </div>

                    {/* Question */}
                    <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 border border-blue-300/60 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-blue-700" />
                        <span className="text-sm font-semibold text-blue-900">
                          คำถาม:
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div
                          className="text-gray-900 markdown-content"
                          dangerouslySetInnerHTML={{
                            __html: expandedResponses.has(
                              `q_${conversation.id}`
                            )
                              ? renderMarkdown(conversation.question)
                              : renderMarkdown(
                                  truncateText(conversation.question).text
                                ),
                          }}
                        />
                        {truncateText(conversation.question).isTruncated && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandedResponse(`q_${conversation.id}`);
                            }}
                            className="text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors hover:bg-blue-50 px-2 py-1 rounded-md"
                          >
                            {expandedResponses.has(`q_${conversation.id}`)
                              ? 'ซ่อน'
                              : 'ดูเพิ่มเติม'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bot Response */}
                    <div className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 border border-green-300/60 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-green-700" />
                        <span className="text-sm font-semibold text-green-900">
                          คำตอบ:
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div
                          className="text-gray-900 markdown-content"
                          dangerouslySetInnerHTML={{
                            __html: expandedResponses.has(
                              conversation.id.toString()
                            )
                              ? renderMarkdown(conversation.bot_response)
                              : renderMarkdown(
                                  truncateText(conversation.bot_response).text
                                ),
                          }}
                        />
                        {truncateText(conversation.bot_response)
                          .isTruncated && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandedResponse(
                                conversation.id.toString()
                              );
                            }}
                            className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors hover:bg-green-50 px-2 py-1 rounded-md"
                          >
                            {expandedResponses.has(conversation.id.toString())
                              ? 'ซ่อน'
                              : 'ดูเพิ่มเติม'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {getSatisfactionIcon(
                          conversation.satisfaction_rating || 0
                        )}
                        <span className="text-neutral-500">
                          ความพึงพอใจ:{' '}
                          {conversation.satisfaction_rating || 'N/A'}/5
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span
                          className={`${getResponseTimeColor(conversation.response_time_ms || 0)}`}
                        >
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

        {/* Pagination */}
        {filteredConversations.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              แสดง {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(
                currentPage * itemsPerPage,
                filteredConversations.length
              )}{' '}
              จาก {filteredConversations.length} รายการ
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ก่อนหน้า
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSearch;
