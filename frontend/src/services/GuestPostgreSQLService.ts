const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API;

export interface GuestMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface GuestConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  messages: GuestMessage[];
}

export interface GuestConversationStats {
  total_conversations: number;
  total_messages: number;
}

class GuestPostgreSQLService {
  private baseUrl = `${BACKEND_API}/chat/guest`;

  /**
   * Send a message and get bot response (logs to PostgreSQL)
   */
  async sendMessage(content: string): Promise<{ message: string; conversation_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending guest message:', error);
      throw error;
    }
  }

  /**
   * Create a new guest conversation
   */
  async createConversation(title: string = 'Guest Conversation'): Promise<GuestConversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating guest conversation:', error);
      throw error;
    }
  }

  /**
   * Get all guest conversations
   */
  async getConversations(): Promise<GuestConversation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching guest conversations:', error);
      throw error;
    }
  }

  /**
   * Get a specific guest conversation
   */
  async getConversation(conversationId: string): Promise<GuestConversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching guest conversation:', error);
      throw error;
    }
  }

  /**
   * Add a message to a guest conversation
   */
  async addMessage(conversationId: string, content: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding guest message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a guest conversation
   */
  async getMessages(conversationId: string): Promise<GuestMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching guest messages:', error);
      throw error;
    }
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<GuestConversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating guest conversation title:', error);
      throw error;
    }
  }

  /**
   * Delete a guest conversation (soft delete)
   */
  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting guest conversation:', error);
      throw error;
    }
  }

  /**
   * Get guest conversation statistics
   */
  async getStats(): Promise<GuestConversationStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching guest stats:', error);
      throw error;
    }
  }
}

export const guestPostgreSQLService = new GuestPostgreSQLService(); 