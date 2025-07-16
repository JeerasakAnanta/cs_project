import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Chatbot from './components/Chatbot';
import Pagenotfound from './components/Pagenotfound';

// Auth Wrapper
import PrivateRoute from './components/PrivateRoute';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Chatbot />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Pagenotfound />} />
        </Routes>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
