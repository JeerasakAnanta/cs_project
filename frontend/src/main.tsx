import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './components/common/ui/TypingIndicator.css';
import { AuthProvider } from './contexts/AuthContext.tsx';

// Global error handler to catch extension-related errors
window.addEventListener('unhandledrejection', (event) => {
  // Check if it's the specific extension error
  if (
    event.reason &&
    typeof event.reason === 'string' &&
    event.reason.includes(
      'message channel closed before a response was received'
    )
  ) {
    // Prevent the error from showing in console
    event.preventDefault();
    console.warn('Browser extension error suppressed:', event.reason);
    return;
  }

  // For other errors, log them normally
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, notify user
                console.log('New version available! Please refresh.');
                // You can show a notification to user here
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
