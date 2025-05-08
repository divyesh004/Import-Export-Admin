import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

const analyticsService = {
  // Get sales analytics
  getSalesAnalytics: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      // Create params object without undefined values
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        seller_id: filters.sellerId,
        breakdown: filters.breakdown // Add breakdown parameter for product-wise revenue
      };
      
      // Only add industry if it's defined
      if (filters.industry) {
        params.industry = filters.industry;
      }

      const response = await axios.get(`${API_URL}analytics/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params
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

      // Create params object without undefined values
      const params = {
        period: filters.period || 'month'
      };
      
      // Only add industry if it's defined
      if (filters.industry) {
        params.industry = filters.industry;
      }

      const response = await axios.get(`${API_URL}analytics/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params
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

      // Create params object without undefined values
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        seller_id: filters.sellerId
      };
      
      // Only add industry if it's defined
      if (filters.industry) {
        params.industry = filters.industry;
      }

      const response = await axios.get(`${API_URL}analytics/sellers`, {
        headers: { Authorization: `Bearer ${token}` },
        params
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

      // Create params object without undefined values
      const params = {
        period: filters.period || 'month'
      };
      
      // Only add industry if it's defined
      if (filters.industry) {
        params.industry = filters.industry;
      }

      const response = await axios.get(`${API_URL}analytics/platform`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get industry breakdown analytics
  getIndustryBreakdown: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      // Create params object without undefined values
      const params = {
        period: filters.period || 'month'
      };
      
      // Add date range if provided
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;

      const response = await axios.get(`${API_URL}analytics/industry-breakdown`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching industry breakdown:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default analyticsService;