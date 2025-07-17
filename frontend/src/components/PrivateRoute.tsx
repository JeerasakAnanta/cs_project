import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactElement;
  role?: 'admin' | 'user';
}

const PrivateRoute: React.FC<Props> = ({ children, role }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (role === 'admin' && !isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
