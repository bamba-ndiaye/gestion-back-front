import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('payflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (response.error) {
      return { success: false, error: response.error };
    }

    const { token, user, redirectUrl } = response.data;
    localStorage.setItem('payflow_token', token);
    localStorage.setItem('payflow_user', JSON.stringify(user));
    setUser(user);

    return { success: true, user, redirectUrl };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('payflow_user');
    localStorage.removeItem('payflow_token');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};