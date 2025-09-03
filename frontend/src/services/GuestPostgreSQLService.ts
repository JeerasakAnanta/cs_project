import { BACKEND_API } from '../config';

export interface GuestMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface GuestConversation {
  id: string;
  machine_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: GuestMessage[];
}

export interface GuestStats {
  total_conversations: number;
  total_messages: number;
  machine_id?: string;
}

class GuestPostgreSQLService {
  private machineId: string | null = null;

  constructor() {
    this.initializeMachineId();
  }

  private async initializeMachineId(): Promise<void> {
    // Try to get existing machine ID from localStorage
    const existingMachineId = localStorage.getItem('guest_machine_id');
    
    if (existingMachineId) {
      this.machineId = existingMachineId;
    } else {
      // Generate new machine ID from server
      try {
        const response = await fetch(`${BACKEND_API}/chat/guest/machine-id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          this.machineId = data.machine_id;
          localStorage.setItem('guest_machine_id', this.machineId || '');
        } else {
          // Fallback: generate client-side machine ID
          this.machineId = this.generateClientMachineId();
          localStorage.setItem('guest_machine_id', this.machineId || '');
        }
      } catch (error) {
        console.error('Error generating machine ID:', error);
        // Fallback: generate client-side machine ID
        this.machineId = this.generateClientMachineId();
        localStorage.setItem('guest_machine_id', this.machineId || '');
      }
    }
  }

  private generateClientMachineId(): string {
    // Generate a client-side machine ID using browser fingerprinting
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    // Create a hash from browser characteristics
    const fingerprint = `${userAgent}-${screenResolution}-${timezone}-${language}`;
    const hash = this.simpleHash(fingerprint);
    
    return `client-${hash}-${Date.now()}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.machineId) {
      headers['X-Machine-ID'] = this.machineId;
    }
    
    return headers;
  }

  async createConversation(title: string): Promise<GuestConversation> {
    const response = await fetch(`${BACKEND_API}/chat/guest/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        title,
        machine_id: this.machineId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }

    return await response.json();
  }

  async getConversations(): Promise<GuestConversation[]> {
    const response = await fetch(`${BACKEND_API}/chat/guest/conversations`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return await response.json();
  }

  async getConversation(id: string): Promise<GuestConversation | null> {
    const response = await fetch(`${BACKEND_API}/chat/guest/conversations/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return await response.json();
  }

  async addMessage(conversationId: string, content: string): Promise<string> {
    const response = await fetch(`${BACKEND_API}/chat/guest/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content,
        machine_id: this.machineId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add message: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message;
  }

  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${BACKEND_API}/chat/guest/conversations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  }

  async getStats(): Promise<GuestStats> {
    const response = await fetch(`${BACKEND_API}/chat/guest/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return await response.json();
  }

  async sendMessage(content: string): Promise<{ message: string; machine_id: string }> {
    const response = await fetch(`${BACKEND_API}/chat/guest/message`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content,
        machine_id: this.machineId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return await response.json();
  }

  getMachineId(): string | null {
    return this.machineId;
  }

  async resetMachineId(): Promise<void> {
    // Remove existing machine ID
    localStorage.removeItem('guest_machine_id');
    this.machineId = null;
    
    // Generate new machine ID
    await this.initializeMachineId();
  }

  // Export conversations for backup
  async exportConversations(): Promise<string> {
    const conversations = await this.getConversations();
    const exportData = {
      machine_id: this.machineId,
      export_date: new Date().toISOString(),
      conversations: conversations
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import conversations from backup
  async importConversations(importData: string): Promise<void> {
    try {
      const data = JSON.parse(importData);
      
      // Validate import data
      if (!data.conversations || !Array.isArray(data.conversations)) {
        throw new Error('Invalid import data format');
      }

      // Import each conversation
      for (const conversation of data.conversations) {
        if (conversation.title && conversation.messages) {
          // Create new conversation with current machine ID
          const newConversation = await this.createConversation(conversation.title);
          
          // Import messages
          for (const message of conversation.messages) {
            if (message.content && message.sender) {
              await this.addMessage(newConversation.id, message.content);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to import conversations: ${error}`);
    }
  }
}

export const guestPostgreSQLService = new GuestPostgreSQLService(); 