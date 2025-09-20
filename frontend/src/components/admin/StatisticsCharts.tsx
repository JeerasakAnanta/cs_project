import React from 'react';
import {
  TrendingUp,
  Users,
  MessageCircle,
  Activity,
  BarChart3,
} from 'lucide-react';

interface ChartData {
  date: string;
  registered: number;
  guest: number;
  total: number;
}

interface RoleDistribution {
  [key: string]: number;
}

interface StatisticsChartsProps {
  dailyStats: ChartData[];
  roleDistribution: RoleDistribution;
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  satisfactionRate: number;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  dailyStats,
  roleDistribution,
  totalUsers,
  totalConversations,
  totalMessages,
  satisfactionRate,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate max value for chart scaling
  const maxValue = Math.max(...dailyStats.map((day) => day.total));

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-100/80 to-blue-200/80 border border-blue-300/60 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-200/60 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-700" />
            </div>
            <span className="text-blue-700 text-sm font-medium">แนวโน้มผู้ใช้</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {formatNumber(totalUsers)}
          </div>
          <div className="w-full bg-blue-200/60 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalUsers / 1000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100/80 to-green-200/80 border border-green-300/60 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-200/60 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-700" />
            </div>
            <span className="text-green-700 text-sm font-medium">แนวโน้มการสนทนา</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {formatNumber(totalConversations)}
          </div>
          <div className="w-full bg-green-200/60 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((totalConversations / 5000) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100/80 to-purple-200/80 border border-purple-300/60 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-200/60 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-700" />
            </div>
            <span className="text-purple-700 text-sm font-medium">แนวโน้มข้อความ</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {formatNumber(totalMessages)}
          </div>
          <div className="w-full bg-purple-200/60 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((totalMessages / 10000) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-gradient-to-br from-slate-100/80 to-gray-100/80 border border-slate-300/60 rounded-xl p-6 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          กราฟกิจกรรมรายวัน (7 วันล่าสุด)
        </h4>

        <div className="space-y-4">
          {/* Chart Bars */}
          <div className="flex items-end justify-between h-48 px-4 pb-4">
            {dailyStats.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center space-y-2"
              >
                {/* Total Bar */}
                <div className="relative">
                  <div
                    className="w-16 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg transition-all duration-500 shadow-md"
                    style={{
                      height: `${(day.total / maxValue) * 120}px`,
                      minHeight: '20px',
                    }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-medium">
                    {formatNumber(day.total)}
                  </div>
                </div>

                {/* Registered Bar */}
                <div className="relative">
                  <div
                    className="w-12 bg-gradient-to-t from-green-600 to-green-500 rounded-t-lg transition-all duration-500 shadow-md"
                    style={{
                      height: `${(day.registered / maxValue) * 120}px`,
                      minHeight: '16px',
                    }}
                  ></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-700">
                    {formatNumber(day.registered)}
                  </div>
                </div>

                {/* Guest Bar */}
                <div className="relative">
                  <div
                    className="w-8 bg-gradient-to-t from-purple-600 to-purple-500 rounded-t-lg transition-all duration-500 shadow-md"
                    style={{
                      height: `${(day.guest / maxValue) * 120}px`,
                      minHeight: '12px',
                    }}
                  ></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-700">
                    {formatNumber(day.guest)}
                  </div>
                </div>

                {/* Date Label */}
                <div className="text-xs text-gray-600 text-center mt-2 font-medium">
                  {formatDate(day.date)}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-300/60">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">รวมทั้งหมด</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">
                ผู้ใช้ที่ลงทะเบียน
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">Guest Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution Pie Chart */}
      <div className="bg-gradient-to-br from-slate-100/80 to-gray-100/80 border border-slate-300/60 rounded-xl p-6 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          การกระจายของ Role (Pie Chart)
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Pie Representation */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* This is a simplified pie chart representation */}
              <div className="w-full h-full rounded-full border-8 border-neutral-700 relative overflow-hidden">
                {Object.entries(roleDistribution).map(
                  ([role, count], index) => {
                    const percentage = (count / totalUsers) * 100;
                    const colors = [
                      '#3B82F6',
                      '#10B981',
                      '#F59E0B',
                      '#EF4444',
                      '#8B5CF6',
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div
                        key={role}
                        className="absolute inset-0"
                        style={{
                          background: `conic-gradient(${color} 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
                          transform: `rotate(${index * 90}deg)`,
                        }}
                      />
                    );
                  }
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {totalUsers}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="space-y-4">
            {Object.entries(roleDistribution).map(([role, count], index) => {
              const percentage = (count / totalUsers) * 100;
              const colors = [
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#EF4444',
                '#8B5CF6',
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={role}
                  className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-white font-medium capitalize">
                      {role}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {formatNumber(count)}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Satisfaction Rate Gauge */}
      <div className="bg-neutral-800/50 border border-neutral-700/30 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-amber-400" />
          อัตราความพึงพอใจ (Satisfaction Rate)
        </h4>

        <div className="flex items-center justify-center">
          <div className="relative w-64 h-32">
            {/* Gauge Background */}
            <div className="w-full h-full bg-neutral-700 rounded-full relative overflow-hidden">
              {/* Gauge Fill */}
              <div
                className="absolute bottom-0 left-0 h-full bg-gradient-to-t from-amber-500 to-green-500 transition-all duration-1000 ease-out"
                style={{
                  width: `${satisfactionRate}%`,
                  clipPath: 'polygon(0 100%, 100% 100%, 50% 0)',
                }}
              ></div>

              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {satisfactionRate}%
                  </div>
                  <div className="text-sm text-neutral-300">ความพึงพอใจ</div>
                </div>
              </div>
            </div>

            {/* Gauge Labels */}
            <div className="flex justify-between mt-2 text-xs text-neutral-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Satisfaction Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {formatNumber(
                Math.round((satisfactionRate / 100) * totalMessages)
              )}
            </div>
            <div className="text-sm text-green-300">
              ข้อความที่ได้รับความพึงพอใจ
            </div>
          </div>
          <div className="text-center p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="text-2xl font-bold text-red-400">
              {formatNumber(
                Math.round(((100 - satisfactionRate) / 100) * totalMessages)
              )}
            </div>
            <div className="text-sm text-red-300">ข้อความที่ต้องปรับปรุง</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCharts;
