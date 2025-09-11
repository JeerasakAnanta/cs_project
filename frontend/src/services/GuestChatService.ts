export interface GuestMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface GuestConversation {
  id: string;
  title: string;
  messages: GuestMessage[];
  createdAt: number;
  updatedAt: number;
}

class GuestChatService {
  private readonly STORAGE_KEY = 'guest_conversations';

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private getConversationsFromStorage(): GuestConversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading guest conversations:', error);
      return [];
    }
  }

  private saveConversations(conversations: GuestConversation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving guest conversations:', error);
    }
  }

  getConversations(): GuestConversation[] {
    return this.getConversationsFromStorage();
  }

  createConversation(title: string): GuestConversation {
    const conversations = this.getConversationsFromStorage();
    const newConversation: GuestConversation = {
      id: this.generateId(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    conversations.unshift(newConversation);
    this.saveConversations(conversations);
    return newConversation;
  }

  getConversation(id: string): GuestConversation | null {
    const conversations = this.getConversationsFromStorage();
    return conversations.find((conv) => conv.id === id) || null;
  }

  addMessage(
    conversationId: string,
    message: Omit<GuestMessage, 'id' | 'timestamp'>
  ): GuestMessage {
    const conversations = this.getConversationsFromStorage();
    const conversationIndex = conversations.findIndex(
      (conv) => conv.id === conversationId
    );

    if (conversationIndex === -1) {
      throw new Error('Conversation not found');
    }

    const newMessage: GuestMessage = {
      ...message,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    conversations[conversationIndex].messages.push(newMessage);
    conversations[conversationIndex].updatedAt = Date.now();

    this.saveConversations(conversations);
    return newMessage;
  }

  updateConversationTitle(
    conversationId: string,
    title: string
  ): GuestConversation | null {
    const conversations = this.getConversationsFromStorage();
    const conversationIndex = conversations.findIndex(
      (conv) => conv.id === conversationId
    );

    if (conversationIndex === -1) {
      return null;
    }

    conversations[conversationIndex].title = title;
    conversations[conversationIndex].updatedAt = Date.now();

    this.saveConversations(conversations);
    return conversations[conversationIndex];
  }

  deleteConversation(conversationId: string): boolean {
    const conversations = this.getConversationsFromStorage();
    const filteredConversations = conversations.filter(
      (conv) => conv.id !== conversationId
    );

    if (filteredConversations.length === conversations.length) {
      return false; // Conversation not found
    }

    this.saveConversations(filteredConversations);
    return true;
  }

  clearAllConversations(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Export conversations for backup or migration
  exportConversations(): string {
    return JSON.stringify(this.getConversationsFromStorage(), null, 2);
  }

  // Import conversations from backup
  importConversations(data: string): boolean {
    try {
      const conversations = JSON.parse(data);
      if (Array.isArray(conversations)) {
        this.saveConversations(conversations);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing conversations:', error);
      return false;
    }
  }
}

export const guestChatService = new GuestChatService();
