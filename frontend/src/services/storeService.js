import api from './api';

export const getAllStores = async (search = {}, sort = {}) => {
  try {
    const response = await api.get('/stores', { params: { ...search, ...sort } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllStoresAdmin = async (filters = {}, sort = {}) => {
    try {
        const response = await api.get('/admin/stores', { params: { ...filters, ...sort } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addStoreAdmin = async (storeData) => {
  try {
    const response = await api.post('/admin/stores', storeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStoreAdmin = async (storeId, storeData) => {
  try {
    const response = await api.put(`/admin/stores/${storeId}`, storeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStoreAdmin = async (storeId) => {
  try {
    const response = await api.delete(`/admin/stores/${storeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStoreOwnerDashboard = async () => {
  try {
    const response = await api.get('/stores/owner/dashboard');
    return response.data;
  } catch (error) {
    throw error;
  }
};