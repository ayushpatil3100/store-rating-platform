// src/services/authService.js
import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Login failed';
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Signup failed';
  }
};

export const updatePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.put('/auth/password', { oldPassword, newPassword });
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Password update failed';
  }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
        return true;
    } catch (error) {
        console.warn('Logout API call failed, but token discarded:', error.response.data.message || error.message);
        return false;
    }
};