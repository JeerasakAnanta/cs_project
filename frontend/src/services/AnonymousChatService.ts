import { BACKEND_API } from '../config';

export interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}

export interface AnonymousMessage {
  content: string;
  sender: 'user' | 'bot';
  source_documents?: DocumentReference[];
}

export interface AnonymousConversation {
  id: string;
  title: string;
  messages: AnonymousMessage[];
}

class AnonymousChatService {
  async sendMessage(message: string): Promise<{ message: string; source_documents?: DocumentReference[] }> {
    try {
      const response = await fetch(`${BACKEND_API}/chat/anonymous/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending anonymous message:', error);
      throw error;
    }
  }

  async createAnonymousConversation(
    title: string
  ): Promise<AnonymousConversation> {
    try {
      const response = await fetch(
        `${BACKEND_API}/chat/anonymous/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating anonymous conversation:', error);
      throw error;
    }
  }

  async addMessageToAnonymousConversation(
    conversationId: string,
    message: string
  ): Promise<{ message: string; source_documents?: DocumentReference[] }> {
    try {
      const response = await fetch(
        `${BACKEND_API}/chat/anonymous/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: message }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding message to anonymous conversation:', error);
      throw error;
    }
  }
}

export const anonymousChatService = new AnonymousChatService();
