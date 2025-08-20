import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw } from 'lucide-react';
import { conversationService, ConversationStats } from '../../services/conversationService';

interface ConversationAnalyticsProps {
  conversations: any[];
}

const ConversationAnalytics: React.FC<ConversationAnalyticsProps> = ({ conversations }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range
      let dateFrom: string | undefined;
      let dateTo: string | undefined;
      
      if (timeRange === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      } else if (timeRange === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
      } else if (timeRange === '90d') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        dateFrom = ninetyDaysAgo.toISOString().split('T')[0];
      }

      const data = await conversationService.getConversationStats({
        dateFrom,
        dateTo
      });
      
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStats();
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            การวิเคราะห์การสนทนา
          </h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            การวิเคราะห์การสนทนา
          </h2>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            ลองใหม่
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            การวิเคราะห์การสนทนา
          </h2>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            โหลดข้อมูล
          </button>
        </div>
        <div className="text-center py-12 text-gray-500">
          ไม่มีข้อมูลการสนทนาให้วิเคราะห์
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          การวิเคราะห์การสนทนา
        </h2>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">7 วันล่าสุด</option>
            <option value="30d">30 วันล่าสุด</option>
            <option value="90d">90 วันล่าสุด</option>
          </select>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">การสนทนาทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_conversations}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">ความพึงพอใจเฉลี่ย</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.average_satisfaction.toFixed(1)}/5</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">เวลาตอบเฉลี่ย</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.average_response_time}ms</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span className="text-sm text-gray-600">ผู้ใช้ที่พึงพอใจ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.satisfaction_distribution.positive}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfaction Trend */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            แนวโน้มความพึงพอใจ ({timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} วันล่าสุด)
          </h3>
          <div className="space-y-3">
            {stats.daily_stats.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-16">{day.date}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(day.avg_satisfaction / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {day.avg_satisfaction.toFixed(1)}/5
                </span>
                <span className="text-xs text-gray-500 w-8 text-right">
                  ({day.count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            การกระจายเวลาตอบสนอง
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.response_time_distribution).map(([key, count]) => {
              const percentage = stats.total_conversations > 0 ? Math.round((count / stats.total_conversations) * 100) : 0;
              const color = key === 'fast' ? 'bg-green-500' : key === 'medium' ? 'bg-blue-500' : 'bg-red-500';
              const label = key === 'fast' ? 'เร็วมาก (<1s)' : key === 'medium' ? 'เร็ว (1-2s)' : 'ช้า (>2s)';
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex-1">{label}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${color} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            ผู้ใช้ที่มีการใช้งานสูงสุด
          </h3>
          <div className="space-y-3">
            {stats.top_users.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-600">
                    {user.total_questions} คำถาม • 
                    <span className={getSatisfactionColor(user.avg_satisfaction)}>
                      {' '}{user.avg_satisfaction.toFixed(1)}/5
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{user.avg_response_time}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Questions */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            คำถามที่พบบ่อย
          </h3>
          <div className="space-y-3">
            {stats.top_questions.map((question, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 mb-2">{question.question}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{question.count} ครั้ง</span>
                  <span className={getSatisfactionColor(question.avg_satisfaction)}>
                    {question.avg_satisfaction.toFixed(1)}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Satisfaction Distribution */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-green-500" />
          การกระจายความพึงพอใจ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-900">พึงพอใจมาก (4-5 ดาว)</p>
            <p className="text-2xl font-bold text-green-600">{stats.satisfaction_distribution.positive}</p>
            <p className="text-xs text-gray-600">
              {stats.total_conversations > 0 ? Math.round((stats.satisfaction_distribution.positive / stats.total_conversations) * 100) : 0}%
            </p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-900">ปานกลาง (3 ดาว)</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.satisfaction_distribution.neutral}</p>
            <p className="text-xs text-gray-600">
              {stats.total_conversations > 0 ? Math.round((stats.satisfaction_distribution.neutral / stats.total_conversations) * 100) : 0}%
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-900">ไม่พึงพอใจ (1-2 ดาว)</p>
            <p className="text-2xl font-bold text-red-600">{stats.satisfaction_distribution.negative}</p>
            <p className="text-xs text-gray-600">
              {stats.total_conversations > 0 ? Math.round((stats.satisfaction_distribution.negative / stats.total_conversations) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationAnalytics;
