import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactElement;
}

const GuestRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isGuestMode } = useAuth();

  // Allow access if user is authenticated OR in guest mode
  if (!isAuthenticated() && !isGuestMode()) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default GuestRoute;
