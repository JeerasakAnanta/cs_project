import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface LoadingSkeletonProps {
  type?: 'message' | 'conversation' | 'card';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'message', 
  count = 1 
}) => {
  const { theme } = useTheme();

  const baseClass = `animate-pulse rounded-lg ${
    theme === 'light' ? 'bg-gray-200' : 'bg-neutral-700'
  }`;

  if (type === 'message') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${baseClass}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-3/4 rounded ${baseClass}`} />
              <div className={`h-4 w-1/2 rounded ${baseClass}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'conversation') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={`h-12 w-full rounded-lg ${baseClass}`} />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={`h-24 w-full rounded-xl ${baseClass}`} />
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;

