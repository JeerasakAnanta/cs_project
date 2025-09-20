import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-neutral-800/50 dark:bg-neutral-800/50 bg-neutral-100/50 hover:bg-neutral-700/50 dark:hover:bg-neutral-700/50 hover:bg-neutral-200/50 border border-neutral-700/30 dark:border-neutral-700/30 border-neutral-300/30 text-neutral-300 dark:text-neutral-300 text-neutral-600 hover:text-yellow-400 dark:hover:text-yellow-400 transition-all duration-200 focus-ring"
      title={theme === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeToggle;
