// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log(`User role ${user.role} not allowed. Allowed: ${allowedRoles}`);
    return <Navigate to="/" replace />;
  }

  console.log('Access granted');
  return <Outlet />;
};

export default ProtectedRoute;