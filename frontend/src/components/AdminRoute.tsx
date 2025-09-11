import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" />; // หรือไปยังหน้า "Unauthorized"
  }

  return <Outlet />;
};

export default AdminRoute;
