import api from './api';

export const submitRating = async (storeId, rating) => {
  try {
    const response = await api.post(`/ratings/${storeId}`, { rating });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyRatings = async () => {
    try {
        const response = await api.get('/ratings/my');
        return response.data;
    } catch (error) {
        console.warn('Backend endpoint /ratings/my not implemented yet. Returning mock data or handling gracefully.');
        return [];
    }
};