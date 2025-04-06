import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const userService = {
  // Get all users with optional role filter
  getUsers: async (role = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first');
      }

      const response = await axios.get(`${API_URL}auth/role/${role || 'all'}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status !== 200) {
        throw new Error('Error retrieving data from server');
      }
      
      if (!response.data) {
        throw new Error('No data found');
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data.error || 'सर्वर एरर';
      }
      throw error.message || 'कुछ गलत हो गया';
    }
  },

  // Approve seller account (Admin only)
  approveSeller: async (userId) => {
    try {
      const response = await axios.patch(`${API_URL}auth/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Ban/unban user (Admin only)
  toggleUserBan: async (userId) => {
    try {
      const response = await axios.patch(`${API_URL}auth/ban/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateUser: async (userData) => {
    try {
      const response = await axios.patch(`${API_URL}auth/update`, userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService;