import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export interface Conversation {
  id: number;
  user_id?: number;
  username: string;
  question: string;
  bot_response: string;
  satisfaction_rating?: number;
  response_time_ms?: number;
  conversation_type: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationFilters {
  search?: string;
  satisfaction?: 'all' | 'positive' | 'neutral' | 'negative';
  responseTime?: 'all' | 'fast' | 'medium' | 'slow';
  dateFrom?: string;
  dateTo?: string;
  username?: string;
}

export interface ConversationStats {
  total_conversations: number;
  average_satisfaction: number;
  average_response_time: number;
  satisfaction_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  response_time_distribution: {
    fast: number;
    medium: number;
    slow: number;
  };
  top_users: Array<{
    username: string;
    total_questions: number;
    avg_satisfaction: number;
    avg_response_time: number;
  }>;
  top_questions: Array<{
    question: string;
    count: number;
    avg_satisfaction: number;
  }>;
  daily_stats: Array<{
    date: string;
    count: number;
    avg_satisfaction: number;
  }>;
}

class ConversationService {
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
   * ดึงรายการการสนทนาทั้งหมด
   */
  async getConversations(
    filters?: ConversationFilters
  ): Promise<Conversation[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.satisfaction && filters.satisfaction !== 'all') {
        params.append('satisfaction', filters.satisfaction);
      }
      if (filters?.responseTime && filters.responseTime !== 'all') {
        params.append('response_time', filters.responseTime);
      }
      if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters?.dateTo) params.append('date_to', filters.dateTo);
      if (filters?.username) params.append('username', filters.username);

      const response = await axios.get<Conversation[]>(
        `${API_BASE_URL}/admin/conversations/?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      if (error.response?.status === 401) {
        throw new Error('ไม่ได้รับอนุญาตให้เข้าถึงข้อมูลการสนทนา');
      }
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูลการสนทนา'
      );
    }
  }

  /**
   * ดึงรายละเอียดการสนทนาเฉพาะ
   */
  async getConversationById(id: number): Promise<Conversation> {
    try {
      const response = await axios.get<Conversation>(
        `${API_BASE_URL}/admin/conversations/${id}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      if (error.response?.status === 404) {
        throw new Error('ไม่พบการสนทนาที่ระบุ');
      }
      if (error.response?.status === 401) {
        throw new Error('ไม่ได้รับอนุญาตให้เข้าถึงข้อมูลการสนทนา');
      }
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูลการสนทนา'
      );
    }
  }

  /**
   * ดึงสถิติการสนทนา
   */
  async getConversationStats(
    filters?: ConversationFilters
  ): Promise<ConversationStats> {
    try {
      const params = new URLSearchParams();

      if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters?.dateTo) params.append('date_to', filters.dateTo);

      const response = await axios.get<ConversationStats>(
        `${API_BASE_URL}/admin/conversations/stats/overview?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversation stats:', error);
      if (error.response?.status === 401) {
        throw new Error('ไม่ได้รับอนุญาตให้เข้าถึงสถิติการสนทนา');
      }
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงสถิติการสนทนา'
      );
    }
  }

  /**
   * อัปเดตความพึงพอใจของการสนทนา
   */
  async updateSatisfaction(id: number, rating: number): Promise<Conversation> {
    try {
      const response = await axios.patch<Conversation>(
        `${API_BASE_URL}/admin/conversations/${id}/satisfaction`,
        { satisfaction_rating: rating },
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error updating satisfaction:', error);
      if (error.response?.status === 404) {
        throw new Error('ไม่พบการสนทนาที่ระบุ');
      }
      if (error.response?.status === 401) {
        throw new Error('ไม่ได้รับอนุญาตให้อัปเดตข้อมูลการสนทนา');
      }
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการอัปเดตความพึงพอใจ'
      );
    }
  }

  /**
   * ลบการสนทนา
   */
  async deleteConversation(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/admin/conversations/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      if (error.response?.status === 404) {
        throw new Error('ไม่พบการสนทนาที่ระบุ');
      }
      if (error.response?.status === 401) {
        throw new Error('ไม่ได้รับอนุญาตให้ลบข้อมูลการสนทนา');
      }
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบการสนทนา'
      );
    }
  }

  /**
   * ส่งออกข้อมูลการสนทนาเป็น CSV
   */
  async exportConversations(filters?: ConversationFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.satisfaction && filters.satisfaction !== 'all') {
        params.append('satisfaction', filters.satisfaction);
      }
      if (filters?.responseTime && filters.responseTime !== 'all') {
        params.append('response_time', filters.responseTime);
      }
      if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters?.dateTo) params.append('date_to', filters.dateTo);
      if (filters?.username) params.append('username', filters.username);

      const response = await axios.get(
        `${API_BASE_URL}/admin/conversations/export/csv?${params.toString()}`,
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error exporting conversations:', error);
      if (error.response?.status === 401) {
        throw new Error('ไม่ได้รับอนุญาตให้ส่งออกข้อมูลการสนทนา');
      }
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการส่งออกข้อมูล'
      );
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
   * Migrate existing conversation data
   */
  async migrateExistingData(): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/conversations/migrate-existing-data`,
        {},
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error migrating data:', error);
      if (error.response?.status === 401) {
        throw new Error('ไม่ได้รับอนุญาตให้ทำการ migration');
      }
      throw new Error(
        error.response?.data?.detail || 'เกิดข้อผิดพลาดในการ migration'
      );
    }
  }
}

export const conversationService = new ConversationService();
//export type { Conversation, ConversationFilters, ConversationStats };
