import React from 'react';

interface TypingIndicatorProps {
  variant?: 'dots' | 'pulse';
  size?: 'small' | 'medium' | 'large';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  variant = 'dots', 
  size = 'medium' 
}) => {
  // Define sizes
  const sizes = {
    small: { dotSize: 4, gap: 2 },
    medium: { dotSize: 8, gap: 4 },
    large: { dotSize: 12, gap: 6 }
  };

  const currentSize = sizes[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: `${currentSize.gap}px`
  };

  const baseDotStyle: React.CSSProperties = {
    width: `${currentSize.dotSize}px`,
    height: `${currentSize.dotSize}px`,
    backgroundColor: '#a855f7',
    borderRadius: '50%',
    opacity: 0.3
  };

  // Add CSS animations to head if they don't exist
  React.useEffect(() => {
    const styleId = 'typing-indicator-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes bounce {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.4);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const delays = variant === 'pulse' ? [0, 0.3, 0.6] : [0, 0.2, 0.4];

  return (
    <div style={containerStyle}>
      <div 
        style={{
          ...baseDotStyle,
          animation: variant === 'pulse' 
            ? `pulse 1.5s infinite ease-in-out ${delays[0]}s`
            : `bounce 1.4s infinite ease-in-out ${delays[0]}s`
        }}
      ></div>
      <div 
        style={{
          ...baseDotStyle,
          animation: variant === 'pulse' 
            ? `pulse 1.5s infinite ease-in-out ${delays[1]}s`
            : `bounce 1.4s infinite ease-in-out ${delays[1]}s`
        }}
      ></div>
      <div 
        style={{
          ...baseDotStyle,
          animation: variant === 'pulse' 
            ? `pulse 1.5s infinite ease-in-out ${delays[2]}s`
            : `bounce 1.4s infinite ease-in-out ${delays[2]}s`
        }}
      ></div>
    </div>
  );
};

export default TypingIndicator; 