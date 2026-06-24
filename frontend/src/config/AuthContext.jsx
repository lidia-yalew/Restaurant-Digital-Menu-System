// config/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { verifyAuth } from '../API/authapi';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    checkAuth();
  }, []);
// AuthContext.jsx — wherever you call verifyAuth on mount
useEffect(() => {
  const checkAuth = async () => {
    const result = await verifyAuth();
    if (result.isAuthenticated) {
      setUser(result.user);
    } else {
      setUser(null); // Don't leave stale user in state
    }
    setLoading(false);
  };
  checkAuth();
}, []);
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const authStatus = await verifyAuth();
      if (authStatus.isAuthenticated) {
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    console.log('Setting user in context:', userData);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login'); // Fix: Proper navigation to login page
  };
 const updateUser = (updatedFields) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth,updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};