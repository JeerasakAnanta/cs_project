import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  queuedMessages: QueuedMessage[];
  addToQueue: (message: QueuedMessage) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export interface QueuedMessage {
  id: string;
  content: string;
  timestamp: number;
  conversationId?: number | string;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load queued messages from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('queuedMessages');
    if (savedQueue) {
      try {
        setQueuedMessages(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Failed to load queued messages:', error);
      }
    }
  }, []);

  // Save queued messages to localStorage
  useEffect(() => {
    localStorage.setItem('queuedMessages', JSON.stringify(queuedMessages));
  }, [queuedMessages]);

  const addToQueue = (message: QueuedMessage) => {
    setQueuedMessages((prev) => [...prev, message]);
  };

  const removeFromQueue = (id: string) => {
    setQueuedMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const clearQueue = () => {
    setQueuedMessages([]);
    localStorage.removeItem('queuedMessages');
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        queuedMessages,
        addToQueue,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

