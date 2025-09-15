import api from './api';

export const getAllUsersAdmin = async (filters, sort) => {
  try {
    const response = await api.get('/admin/users', { params: { ...filters, ...sort } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addUserAdmin = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserAdmin = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserAdmin = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdminDashboardMetrics = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
