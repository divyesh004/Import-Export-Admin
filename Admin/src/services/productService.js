import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

const productService = {
  // Get all products (admin can see all statuses)
  getAllProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Transform the response to include seller name
      const products = response.data.map(product => ({
        ...product,
        sellerName: product.users?.name || 'Unknown Seller'
      }));
      return products;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending products
  getPendingProducts: async () => {
    try {
      // Get user role from localStorage
      const userRole = localStorage.getItem('userRole');
      
      // Use different endpoint for sub-admin to get industry-specific products
      const endpoint = userRole === 'sub-admin' 
        ? `${API_URL}products/industry/pending` 
        : `${API_URL}products/pending`;
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Transform the response to include seller name
      const products = response.data.map(product => ({
        ...product,
        seller: product.users?.name || 'Unknown Seller'
      }));
      return products;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get rejected products
  getRejectedProducts: async () => {
    try {
      // Get user role from localStorage
      const userRole = localStorage.getItem('userRole');
      
      // Use different endpoint for sub-admin to get industry-specific products
      const endpoint = userRole === 'sub-admin' 
        ? `${API_URL}products/industry/rejected` 
        : `${API_URL}products/rejected`;
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Transform the response to include seller name
      const products = response.data.map(product => ({
        ...product,
        sellerName: product.users?.name || 'Unknown Seller'
      }));
      return products;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get approved products
  getApprovedProducts: async () => {
    try {
      // Get user role from localStorage
      const userRole = localStorage.getItem('userRole');
      
      // Use different endpoint for sub-admin to get industry-specific products
      const endpoint = userRole === 'sub-admin' 
        ? `${API_URL}products/industry/approved` 
        : `${API_URL}products/approved`;
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Transform the response to include seller name
      const products = response.data.map(product => ({
        ...product,
        sellerName: product.users?.name || 'Unknown Seller'
      }));
      return products;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update product status (approve/reject)
  updateProductStatus: async (productId, status) => {
    try {
      if (!productId || !status) {
        throw new Error('Product ID and status are required');
      }
      const response = await axios.patch(
        `${API_URL}products/approve/${productId}`,
        { status: status === 'approve' ? 'approved' : 'rejected' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error.response?.data || error.message;
    }
  },
};

export default productService;