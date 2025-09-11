import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Monitor,
  BarChart3,
  PieChart,
  Calendar,
  Eye,
  BarChart,
} from 'lucide-react';

import {
  adminStatisticsService,
  SystemStats,
  UserStats,
  ConversationStats,
} from '../../services/adminStatisticsService';
import StatisticsCharts from './StatisticsCharts';
import { useTheme } from '../../contexts/ThemeContext';

const SystemStatistics: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [conversationStats, setConversationStats] =
    useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { theme } = useTheme();
  const [showCharts, setShowCharts] = useState(false);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all statistics using the service
      const allStats = await adminStatisticsService.getAllStatistics();

      setSystemStats(allStats.system);
      setUserStats(allStats.users);
      setConversationStats(allStats.conversations);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const handleRefresh = () => {
    fetchSystemStats();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">กำลังโหลดสถิติระบบ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!systemStats || !userStats || !conversationStats) {
    return (
      <div
        className={`text-center ${
          theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
        }`}
      >
        ไม่พบข้อมูลสถิติ
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh and Charts Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className={`text-lg font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}
          >
            สถิติระบบทั้งหมด
          </h3>
          <p
            className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
            }`}
          >
            อัปเดตล่าสุด: {formatDate(systemStats.system.last_updated)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showCharts
                ? theme === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-primary-600 text-white'
                : theme === 'light'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {showCharts ? (
              <Eye className="w-4 h-4 mr-2" />
            ) : (
              <BarChart className="w-4 h-4 mr-2" />
            )}
            {showCharts ? 'ซ่อนกราฟ' : 'แสดงกราฟ'}
          </button>
          <button
            onClick={handleRefresh}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              theme === 'light'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div
          className={`card p-6 ${
            theme === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-neutral-800 border-neutral-700'
          }`}
        >
          <StatisticsCharts
            dailyStats={conversationStats.daily_stats_last_7_days}
            roleDistribution={systemStats.users.role_distribution}
            totalUsers={systemStats.users.total}
            totalConversations={systemStats.conversations.total_all}
            totalMessages={systemStats.messages.total_all}
            satisfactionRate={systemStats.feedbacks.satisfaction_rate}
          />
        </div>
      )}

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div
          className={`bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 ${
            theme === 'light'
              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
              : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'
              }`}
            >
              <Users
                className={`w-6 h-6 ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}
              />
            </div>
            <TrendingUp
              className={`w-5 h-5 ${
                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
              }`}
            />
          </div>
          <h3
            className={`text-2xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}
          >
            {formatNumber(systemStats.users.total)}
          </h3>
          <p
            className={`text-sm mb-3 ${
              theme === 'light' ? 'text-blue-700' : 'text-blue-300'
            }`}
          >
            ผู้ใช้ทั้งหมด
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span
                className={
                  theme === 'light' ? 'text-blue-600' : 'text-blue-200'
                }
              >
                Active
              </span>
              <span
                className={`font-medium ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}
              >
                {formatNumber(systemStats.users.active)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span
                className={
                  theme === 'light' ? 'text-blue-600' : 'text-blue-200'
                }
              >
                Inactive
              </span>
              <span
                className={`font-medium ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}
              >
                {formatNumber(systemStats.users.inactive)}
              </span>
            </div>
          </div>
        </div>

        {/* Conversations Card */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-2">
            {formatNumber(systemStats.conversations.total_all)}
          </h3>

          {/* การสนทนาทั้งหมด */}
          <p className="text-green-900 text-sm mb-3">การสนทนาทั้งหมด</p>
          <div className="space-y-1">
            {/* display registered  */}
            <div className="flex justify-between text-xs">
              <span className="text-green-900">Registered</span>
              <span className="text-black font-medium">
                {formatNumber(systemStats.conversations.total_registered)}
              </span>
            </div>

            {/* display  guest  */}
            <div className="flex justify-between text-xs">
              <span className="text-green-900">Guest</span>
              <span className="text-black font-medium">
                {formatNumber(systemStats.conversations.total_guest)}
              </span>
            </div>
          </div>
        </div>

        {/* Messages Card */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          {/* number of messages */}
          <h3 className="text-2xl font-bold text-black mb-2">
            {formatNumber(systemStats.messages.total_all)}
          </h3>
          <p className="text-purple-900 text-sm mb-3">ข้อความทั้งหมด</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              {/* display  user  */}
              <span className="text-purple-900">User</span>
              <span className="text-white-900 font-medium">
                {formatNumber(
                  systemStats.messages.user_messages_registered +
                    systemStats.messages.user_messages_guest
                )}
              </span>
            </div>

            {/* display  bot  messages */}
            <div className="flex justify-between text-xs">
              <span className="text-purple-900">Bot</span>
              <span className="text-white-900 font-medium">
                {formatNumber(
                  systemStats.messages.bot_messages_registered +
                    systemStats.messages.bot_messages_guest
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-amber-400" />
            </div>
            <PieChart className="w-5 h-5 text-amber-400" />
          </div>
          {/* satisfaction rate */}
          <h3 className="text-2xl font-bold text-balack mb-2">
            {systemStats.feedbacks.satisfaction_rate}%
          </h3>
          <p className="text-amber-900 text-sm mb-3">ความพึงพอใจ</p>
          <div className="space-y-1">
            {/* display  likes  */}
            <div className="flex justify-between text-xs">
              <span className="text-amber-900">Likes</span>
              <span className="text-black font-medium">
                {formatNumber(systemStats.feedbacks.likes)}
              </span>
            </div>

            {/* display  dislikes  */}
            <div className="flex justify-between text-xs">
              <span className="text-amber-900">Dislikes</span>
              <span className="text-black font-medium">
                {formatNumber(systemStats.feedbacks.dislikes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className=" bg-gradient-to-br from-slate-600/20 to-slate-800/20 border border-slate-500/30 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-400" />
            การกระจายของ Role
          </h4>
          <div className="space-y-3">
            {Object.entries(systemStats.users.role_distribution).map(
              ([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-black-300 capitalize">{role}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${(count / systemStats.users.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-black font-medium min-w-[3rem] text-right">
                      {formatNumber(count)}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className=" bg-gradient-to-br from-lime-500/20 to-lime-200/20 border border-lime-200/30rounded-xl p-6">
          <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-800" />
            กิจกรรมล่าสุด (7 วัน)
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lime-900">การสนทนาใหม่</span>
              <span className="text-green-900 font-medium">
                {formatNumber(systemStats.conversations.recent_total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lime-900">ข้อความใหม่</span>
              <span className="text-green-900 font-medium">
                {formatNumber(systemStats.messages.recent_total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lime-900">เครื่องที่ใช้งาน</span>
              <span className="text-green-900 font-medium">
                {formatNumber(systemStats.system.unique_machines)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Statistics Chart */}
      <div className="bg-sky-300/50 border border-sky-300/30 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-amber-400" />
          สถิติรายวัน (7 วันล่าสุด)
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {conversationStats.daily_stats_last_7_days.map((day, index) => (
            <div key={day.date} className="text-center">
              <div className="text-xs text-black-400 mb-2">
                {new Date(day.date).toLocaleDateString('th-TH', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="bg-neutral-700/50 rounded-lg p-2">
                <div className="text-lg font-bold text-white mb-1">
                  {formatNumber(day.total)}
                </div>
                <div className="text-xs text-neutral-400">
                  <div className="text-green-400">
                    {formatNumber(day.registered)}
                  </div>
                  <div className="text-blue-400">{formatNumber(day.guest)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Users */}
      {userStats.top_users_by_conversations.length > 0 && (
        <div className="bg-green-300 border border-green-300 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            ผู้ใช้ที่มีการสนทนามากที่สุด
          </h4>
          <div className="space-y-3">
            {userStats.top_users_by_conversations
              .slice(0, 5)
              .map((user, index) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-500 text-black'
                          : index === 1
                            ? 'bg-gray-400 text-black'
                            : index === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-neutral-600 text-white'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">
                      {user.username}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-black-400">
                      {formatNumber(user.conversation_count)}
                    </div>
                    <div className="text-xs text-black-400">การสนทนา</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="bg-yellow-200 border border-yellow-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-black  mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-blue-400" />
          สถานะระบบ
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-black font-medium">ระบบออนไลน์</div>
              <div className="text-green-900 text-sm">ทำงานปกติ</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-balack font-medium">อัปเดตล่าสุด</div>
              <div className="text-blue-900 text-sm">
                {formatDate(systemStats.system.last_updated)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <Activity className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-black font-medium">เครื่องที่ใช้งาน</div>
              <div className="text-purple-900 text-sm">
                {formatNumber(systemStats.system.unique_machines)} เครื่อง
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatistics;
