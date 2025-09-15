import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { setToken, getToken, removeToken, setUser, getUser, removeUser } from '../utils/localStorage';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setUserState(null);
  }, []);


  useEffect(() => {
    const validateTokenAndFetchUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const freshUser = await authService.getProfile();
          setUserState(freshUser);
          setUser(freshUser); 
        } catch (error) {
          console.error("Token validation failed, logging out.", error);
          logout();
        }
      }
      setLoading(false);
    };

    validateTokenAndFetchUser();
  }, [logout]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setUserState(data.user);
      return data.user; 
    } catch (error) {
      console.error('Login failed:', error);
      throw error.response?.data?.message || 'Failed to log in. Please check your credentials.';
    } finally {
      setLoading(false);
    }
  }, []);

  
  const refreshUser = useCallback((newUser) => {
    setUser(newUser);
    setUserState(newUser);
  }, []);


  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user && !!getToken(),
    isAdmin: user?.role === 'System Administrator',
    isStoreOwner: user?.role === 'Store Owner',
    isNormalUser: user?.role === 'Normal User',
    login,
    logout,
    loading,
    refreshUser,
  }), [user, loading, login, logout, refreshUser]);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);