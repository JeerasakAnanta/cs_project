import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded: { sub: string; role: string } = jwtDecode(token);
        setCurrentUser({ username: decoded.sub, role: decoded.role });
      } catch (error) {
        // Handle token decoding error, e.g., by logging out
        logout();
      }
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 