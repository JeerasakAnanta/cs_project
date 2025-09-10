import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type SectionTheme = 'chat' | 'admin';

interface ThemeContextType {
  theme: Theme;
  sectionTheme: SectionTheme;
  toggleTheme: () => void;
  setSectionTheme: (section: SectionTheme) => void;
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
    // บังคับใช้ธีมสว่างเป็นค่าเริ่มต้นเสมอ
    return 'light';
  });

  const [sectionTheme, setSectionTheme] = useState<SectionTheme>(() => {
    // ตรวจสอบว่าอยู่ในหน้าไหน
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin')) {
      return 'admin';
    }
    return 'chat';
  });

  useEffect(() => {
    // บังคับใช้ธีมสว่างเสมอ
    setTheme('light');
    
    // Save theme to localStorage
    localStorage.setItem('theme', 'light');

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light');

    // Update CSS custom properties for light theme only
    root.style.setProperty('--chat-bg', '#f8fafc');
    root.style.setProperty('--chat-sidebar', '#ffffff');
    root.style.setProperty('--chat-message-user', '#3b82f6');
    root.style.setProperty('--chat-message-bot', '#000000');
    root.style.setProperty('--chat-input', '#f1f5f9');
    root.style.setProperty('--text-primary', '#000000');
    root.style.setProperty('--text-secondary', '#000000');
    root.style.setProperty('--border-color', '#e2e8f0');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--hover-bg', '#f8fafc');
    root.style.setProperty('--accent-color', '#3b82f6');
    root.style.setProperty('--success-color', '#10b981');
    root.style.setProperty('--error-color', '#ef4444');
    root.style.setProperty('--warning-color', '#f59e0b');
  }, [theme]);

  // ตรวจสอบการเปลี่ยนแปลง path เพื่อเปลี่ยน section theme
  useEffect(() => {
    const handlePathChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        setSectionTheme('admin');
      } else {
        setSectionTheme('chat');
      }
    };

    // ตรวจสอบ path เมื่อ component mount
    handlePathChange();

    // ฟังการเปลี่ยนแปลง path
    window.addEventListener('popstate', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  const toggleTheme = () => {
    // ปิดการใช้งานการเปลี่ยนธีม - บังคับใช้ธีมสว่างเสมอ
    setTheme('light');
  };

  return (
    <ThemeContext.Provider value={{ theme, sectionTheme, toggleTheme, setSectionTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};