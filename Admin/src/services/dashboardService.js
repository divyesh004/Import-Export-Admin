import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

const dashboardService = {
  // Get dashboard statistics including total customers, total sellers, pending questions, and monthly income
  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.get(`${API_URL}analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get recent activities for dashboard
  getRecentActivities: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.get(`${API_URL}analytics/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default dashboardService;