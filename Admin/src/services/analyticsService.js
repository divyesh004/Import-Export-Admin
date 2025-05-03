import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

const analyticsService = {
  // Get sales analytics
  getSalesAnalytics: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.get(`${API_URL}analytics/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: filters.startDate,
          end_date: filters.endDate,
          seller_id: filters.sellerId,
          industry: filters.industry
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get user activity analytics
  getUserAnalytics: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.get(`${API_URL}analytics/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          period: filters.period || 'month',
          industry: filters.industry
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get seller performance analytics
  getSellerAnalytics: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.get(`${API_URL}analytics/sellers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: filters.startDate,
          end_date: filters.endDate,
          seller_id: filters.sellerId,
          industry: filters.industry
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get platform overview
  getPlatformAnalytics: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.get(`${API_URL}analytics/platform`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          period: filters.period || 'month',
          industry: filters.industry
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default analyticsService;