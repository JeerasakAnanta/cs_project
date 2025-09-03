import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference, default to dark
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update CSS custom properties for theme colors
    if (theme === 'light') {
      root.style.setProperty('--chat-bg', '#fafbfc');
      root.style.setProperty('--chat-sidebar', '#ffffff');
      root.style.setProperty('--chat-message-user', '#3b82f6');
      root.style.setProperty('--chat-message-bot', '#ffffff');
      root.style.setProperty('--chat-input', '#f8fafc');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
    } else {
      root.style.setProperty('--chat-bg', '#0f0f23');
      root.style.setProperty('--chat-sidebar', '#1a1a2e');
      root.style.setProperty('--chat-message-user', '#3b82f6');
      root.style.setProperty('--chat-message-bot', '#1f2937');
      root.style.setProperty('--chat-input', '#374151');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#9ca3af');
      root.style.setProperty('--border-color', '#374151');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
