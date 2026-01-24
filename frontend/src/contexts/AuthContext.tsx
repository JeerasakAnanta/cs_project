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
  isGuestMode: () => boolean;
  login: (token: string) => void;
  logout: () => void;
  enableGuestMode: () => void;
  disableGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    // ถ้าไม่มี token และไม่มี guestMode ใน localStorage ให้เริ่มต้นเป็น guest mode
    const hasToken = localStorage.getItem('authToken');
    const guestMode = localStorage.getItem('guestMode');
    if (!hasToken && guestMode !== 'true' && guestMode !== 'false') {
      localStorage.setItem('guestMode', 'true');
      return true;
    }
    return guestMode === 'true';
  });

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (typeof decoded === 'object' && decoded !== null && 'sub' in decoded && 'role' in decoded) {
          setCurrentUser({ 
            username: String(decoded.sub), 
            role: String(decoded.role) 
          });
          // Disable guest mode when user logs in
          setIsGuest(false);
          localStorage.removeItem('guestMode');
        } else {
          logout();
        }
      } catch (error) {
        // Handle token decoding error without calling logout to prevent infinite loops
        localStorage.removeItem('authToken');
        setToken(null);
        setCurrentUser(null);
      }
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    // Disable guest mode when user logs in
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
  };

  const enableGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('guestMode', 'true');
    // Clear any existing auth token when entering guest mode
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
  };

  const disableGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const isGuestMode = () => {
    return isGuest;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        isGuestMode,
        login,
        logout,
        enableGuestMode,
        disableGuestMode,
      }}
    >
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
