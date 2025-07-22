import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './components/TypingIndicator.css';
import { AuthProvider } from './contexts/AuthContext.tsx';

// Global error handler to catch extension-related errors
window.addEventListener('unhandledrejection', (event) => {
  // Check if it's the specific extension error
  if (event.reason && typeof event.reason === 'string' && 
      event.reason.includes('message channel closed before a response was received')) {
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
