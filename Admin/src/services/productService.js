import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
      const response = await axios.get(`${API_URL}products/pending`, {
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
      const response = await axios.get(`${API_URL}products/rejected`, {
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
      const response = await axios.get(`${API_URL}products/approved`, {
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