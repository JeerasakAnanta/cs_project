import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const isAdmin = () => {
    if (!token) return false;
    try {
      const decoded: { role?: string } = jwtDecode(token);
      return decoded.role === 'admin';
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
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