import api from './api';

const productRequestService = {
  // Get all product requests
  getAllRequests: async (params = {}) => {
    try {
      // Get user role and industry from localStorage
      const userRole = localStorage.getItem('userRole');
      const userIndustry = localStorage.getItem('userIndustry');
      
      // Add industry parameter for sub-admin users
      let queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (params.status) queryParams.append('status', params.status.toLowerCase());
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      
      // Add industry filter for sub-admin users
      if (userRole === 'sub-admin' && userIndustry) {
        queryParams.append('industry', userIndustry);
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await api.get(`product-requests${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product requests:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get product request by ID
  getRequestById: async (requestId) => {
    try {
      const response = await api.get(`product-requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product request details:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update product request status
  updateRequestStatus: async (requestId, status, rejectionReason = '') => {
    try {
      // Ensure status is lowercase for consistency with API
      const data = { status: status.toLowerCase() };
      
      // Add rejection reason if status is 'rejected' and reason provided
      if (status.toLowerCase() === 'rejected' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      
      // Using PATCH method as defined in the backend router
      const response = await api.patch(`product-requests/${requestId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating product request status:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get approved product requests (for sellers)
  getApprovedRequests: async (params = {}) => {
    try {
      let queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await api.get(`product-requests/approved${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approved product requests:', error);
      throw error.response?.data || error.message;
    }
  },

  // Delete a product request
  deleteRequest: async (requestId) => {
    try {
      const response = await api.delete(`product-requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product request:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default productRequestService;