import api from './api';

const orderService = {
  // Get all orders
  getAllOrders: async (params = {}) => {
    try {
      // Get user role and industry from localStorage
      const userRole = localStorage.getItem('userRole');
      const userIndustry = localStorage.getItem('userIndustry');
      
      // Add industry parameter for sub-admin users
      let queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (params.status) queryParams.append('status', params.status.toLowerCase()); // Ensure lowercase status
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      
      // Add industry filter for sub-admin users
      if (userRole === 'sub-admin' && userIndustry) {
        queryParams.append('industry', userIndustry);
      }
      
      // Add showApprovedOnly parameter for sellers
      // This ensures sellers only see orders with approved products
      if (params.showApprovedOnly || userRole === 'seller') {
        queryParams.append('showApprovedOnly', 'true');
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await api.get(`orders${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get orders by status
  getOrdersByStatus: async (status) => {
    try {
      const response = await api.get(`orders?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${status} orders:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, rejectionReason = '') => {
    try {
      // Ensure status is lowercase for consistency with API
      const data = { status: status.toLowerCase() };
      
      // Add rejection reason if status is 'rejected'
      if (status.toLowerCase() === 'rejected' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      
      // Using PATCH method as defined in the backend router
      const response = await api.patch(`orders/${orderId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    try {
      const response = await api.get(`orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error.response?.data || error.message;
    }
  },
  
  // Get order statistics
  getOrderStats: async () => {
    try {
      const response = await api.get('orders/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error.response?.data || error.message;
    }
  }
};

// No mock data needed as we're using real API

export default orderService;