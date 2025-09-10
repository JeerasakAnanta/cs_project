import { BACKEND_API } from '../config';

export interface AnonymousMessage {
  content: string;
  sender: 'user' | 'bot';
}

export interface AnonymousConversation {
  id: string;
  title: string;
  messages: AnonymousMessage[];
}

class AnonymousChatService {
  async sendMessage(message: string): Promise<string> {
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
      return data.message;
    } catch (error) {
      console.error('Error sending anonymous message:', error);
      throw error;
    }
  }

  async createAnonymousConversation(title: string): Promise<AnonymousConversation> {
    try {
      const response = await fetch(`${BACKEND_API}/chat/anonymous/conversations`, {
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
      console.error('Error creating anonymous conversation:', error);
      throw error;
    }
  }

  async addMessageToAnonymousConversation(
    conversationId: string, 
    message: string
  ): Promise<string> {
    try {
      const response = await fetch(`${BACKEND_API}/chat/anonymous/conversations/${conversationId}/messages`, {
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
      return data.message;
    } catch (error) {
      console.error('Error adding message to anonymous conversation:', error);
      throw error;
    }
  }
}

export const anonymousChatService = new AnonymousChatService(); 