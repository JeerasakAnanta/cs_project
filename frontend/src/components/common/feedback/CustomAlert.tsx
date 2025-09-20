import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />;
      case 'info':
        return <AlertCircle className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-neutral-800/95 border-green-500/30 backdrop-blur-sm';
      case 'error':
        return 'bg-neutral-800/95 border-red-500/30 backdrop-blur-sm';
      case 'warning':
        return 'bg-neutral-800/95 border-yellow-500/30 backdrop-blur-sm';
      case 'info':
        return 'bg-neutral-800/95 border-blue-500/30 backdrop-blur-sm';
      default:
        return 'bg-neutral-800/95 border-blue-500/30 backdrop-blur-sm';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div
        className={`${getBgColor()} backdrop-blur-sm border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-black/50 transform transition-all duration-300 animate-in zoom-in-95 duration-300`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">{getIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${getTitleColor()}`}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-neutral-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {message && (
              <p className="mt-2 text-neutral-300 text-sm leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
