import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// Types for statistics data
export interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    role_distribution: Record<string, number>;
  };
  conversations: {
    total_registered: number;
    total_guest: number;
    total_all: number;
    recent_registered: number;
    recent_guest: number;
    recent_total: number;
  };
  messages: {
    total_registered: number;
    total_guest: number;
    total_all: number;
    user_messages_registered: number;
    bot_messages_registered: number;
    user_messages_guest: number;
    bot_messages_guest: number;
    recent_registered: number;
    recent_guest: number;
    recent_total: number;
  };
  feedbacks: {
    total: number;
    likes: number;
    dislikes: number;
    satisfaction_rate: number;
  };
  system: {
    unique_machines: number;
    last_updated: string;
  };
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  role_distribution: Record<string, number>;
  top_users_by_conversations: Array<{
    username: string;
    conversation_count: number;
  }>;
}

export interface ConversationStats {
  total_registered: number;
  total_guest: number;
  total_all: number;
  recent_30_days: {
    registered: number;
    guest: number;
    total: number;
  };
  daily_stats_last_7_days: Array<{
    date: string;
    registered: number;
    guest: number;
    total: number;
  }>;
}

class AdminStatisticsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('ไม่พบ token การเข้าสู่ระบบ');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * ดึงสถิติระบบทั้งหมด
   */
  async getSystemStatistics(): Promise<SystemStats> {
    try {
      const response = await axios.get<SystemStats>(
        `${API_BASE_URL}/admin/statistics/`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system statistics:', error);
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงสถิติระบบ'
      );
    }
  }

  /**
   * ดึงสถิติผู้ใช้
   */
  async getUserStatistics(): Promise<UserStats> {
    try {
      const response = await axios.get<UserStats>(
        `${API_BASE_URL}/admin/statistics/users/`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user statistics:', error);
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงสถิติผู้ใช้'
      );
    }
  }

  /**
   * ดึงสถิติการสนทนา
   */
  async getConversationStatistics(): Promise<ConversationStats> {
    try {
      const response = await axios.get<ConversationStats>(
        `${API_BASE_URL}/admin/statistics/conversations/`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversation statistics:', error);
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงสถิติการสนทนา'
      );
    }
  }

  /**
   * ดึงสถิติทั้งหมดพร้อมกัน
   */
  async getAllStatistics(): Promise<{
    system: SystemStats;
    users: UserStats;
    conversations: ConversationStats;
  }> {
    try {
      const [systemStats, userStats, conversationStats] = await Promise.all([
        this.getSystemStatistics(),
        this.getUserStatistics(),
        this.getConversationStatistics(),
      ]);

      return {
        system: systemStats,
        users: userStats,
        conversations: conversationStats,
      };
    } catch (error: any) {
      console.error('Error fetching all statistics:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ API
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  /**
   * ดึงข้อมูลสถิติแบบ real-time (สำหรับ auto-refresh)
   */
  async getRealTimeStats(): Promise<{
    timestamp: string;
    stats: SystemStats;
  }> {
    try {
      const stats = await this.getSystemStatistics();
      return {
        timestamp: new Date().toISOString(),
        stats,
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const adminStatisticsService = new AdminStatisticsService();
