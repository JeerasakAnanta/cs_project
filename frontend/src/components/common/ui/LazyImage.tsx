import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholder, 
  className = '',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imgRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              if (imgRef.current) {
                observer.unobserve(imgRef.current);
              }
            }
          });
        },
        {
          rootMargin: '50px',
        }
      );

      observer.observe(imgRef.current);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      setImageSrc(src);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
        {...props}
      />
      {!imageLoaded && (
        <div
          className={`absolute inset-0 animate-pulse ${
            theme === 'light' ? 'bg-gray-200' : 'bg-neutral-700'
          }`}
        />
      )}
    </div>
  );
};

export default LazyImage;

