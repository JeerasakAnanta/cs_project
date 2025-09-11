import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'กำลังโหลด...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} border-2 border-neutral-600 rounded-full animate-spin`}
        ></div>
        {/* Inner gradient ring */}
        <div
          className={`${sizeClasses[size]} border-2 border-transparent border-t-primary-500 rounded-full animate-spin absolute inset-0`}
        ></div>
        {/* Glow effect */}
        <div
          className={`${sizeClasses[size]} border-2 border-transparent border-t-primary-400 rounded-full animate-spin absolute inset-0 blur-sm opacity-50`}
        ></div>
      </div>
      {text && (
        <p className={`${textSizes[size]} text-neutral-400 mt-3 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
