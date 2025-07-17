import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'กำลังโหลด...',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}></div>
      {text && (
        <p className="mt-2 text-sm text-gray-500">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 