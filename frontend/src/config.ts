// Backend API configuration
const getBackendUrl = () => {
  // Check if we're in production by looking at the current URL
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.protocol === 'https:';
  
  // If environment variable is set, use it
  if (import.meta.env.VITE_BACKEND_CHATBOT_API) {
    return import.meta.env.VITE_BACKEND_CHATBOT_API;
  }
  
  // In production with Cloudflare Tunnel, use HTTPS for backend
  if (isProduction) {
    return 'https://10.50.5.31:8001';
  }
  
  // In development, use localhost
  return 'http://localhost:8001';
};

const getDocsUrl = () => {
  // Check if we're in production by looking at the current URL
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.protocol === 'https:';
  
  // If environment variable is set, use it
  if (import.meta.env.VITE_BACKEND_DOCS_STATIC) {
    return import.meta.env.VITE_BACKEND_DOCS_STATIC;
  }
  
  // In production with Cloudflare Tunnel, use HTTPS for backend
  if (isProduction) {
    return 'https://10.50.5.31:8001';
  }
  
  // In development, use localhost
  return 'http://localhost:8001';
};

export const BACKEND_API = getBackendUrl();
export const DOCS_STATIC = getDocsUrl();

// Guest mode configuration
export const GUEST_MODE_CONFIG = {
  // Machine ID storage key
  MACHINE_ID_KEY: 'guest_machine_id',
  
  // Guest mode storage key
  GUEST_MODE_KEY: 'guestMode',
  
  // Auto-entry enabled
  AUTO_ENTRY_ENABLED: true,
  
  // Default conversation title length
  MAX_TITLE_LENGTH: 50,
  
  // Export/Import settings
  EXPORT_FILENAME: 'guest_conversations_backup.json',
};

// Chat configuration
export const CHAT_CONFIG = {
  // Message formatting
  BOT_MESSAGE_FORMATTING: true,
  
  // Auto-scroll
  AUTO_SCROLL_ENABLED: true,
  
  // Typing indicator
  TYPING_INDICATOR_ENABLED: true,
  
  // Message delay (ms)
  TYPING_DELAY: 1000,
};

// UI configuration
export const UI_CONFIG = {
  // Theme
  DEFAULT_THEME: 'dark',
  
  // Language
  DEFAULT_LANGUAGE: 'th',
  
  // Responsive breakpoints
  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },
};

// Error handling
export const ERROR_CONFIG = {
  // Retry attempts
  MAX_RETRY_ATTEMPTS: 3,
  
  // Retry delay (ms)
  RETRY_DELAY: 1000,
  
  // Timeout (ms)
  REQUEST_TIMEOUT: 30000,
}; 