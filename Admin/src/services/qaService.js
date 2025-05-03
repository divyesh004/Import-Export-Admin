import axios from 'axios';
import { API_BASE_URL } from '../config/env';

// QA Service for handling all QA-related API calls
const qaService = {
  // Get all questions with optional filtering
  getAllQuestions: async (params = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await axios.get(`${API_BASE_URL}qa/questions/all${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        questions: response.data,
        total: response.data.length
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching questions:', error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Get pending questions that need moderation
  getPendingQuestions: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      // Get user role and industry directly from localStorage
      const userRole = localStorage.getItem('userRole');
      const userIndustry = localStorage.getItem('userIndustry');
      
      // For debugging
      if (process.env.NODE_ENV !== 'production') {
        console.log('User role from localStorage:', userRole, 'User industry from localStorage:', userIndustry);
      }

      // Store user info in request headers for backend filtering
      const headers = { 
        Authorization: `Bearer ${token}`,
        'X-User-Role': userRole || '',
        'X-User-Industry': userIndustry || ''
      };
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending headers to backend:', headers);
      }

      const response = await axios.get(`${API_BASE_URL}qa/questions/pending`, { headers });
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Pending questions response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching pending questions:', error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Get pending answers that need moderation
  getPendingAnswers: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');
      
      // Get user role and industry directly from localStorage
      const userRole = localStorage.getItem('userRole');
      const userIndustry = localStorage.getItem('userIndustry');
      
      // For debugging
      if (process.env.NODE_ENV !== 'production') {
        console.log('User role for answers from localStorage:', userRole, 'User industry from localStorage:', userIndustry);
      }

      // Store user info in request headers for backend filtering
      const headers = { 
        Authorization: `Bearer ${token}`,
        'X-User-Role': userRole || '',
        'X-User-Industry': userIndustry || ''
      };
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending headers to backend for answers:', headers);
      }

      const response = await axios.get(`${API_BASE_URL}qa/answers/pending`, { headers });
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Pending answers response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching pending answers:', error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Get answers for a specific question
  getQuestionAnswers: async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.get(`${API_BASE_URL}qa/answers/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`Error fetching answers for question ${questionId}:`, error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Create a new question
  createQuestion: async (questionData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.post(`${API_BASE_URL}qa/questions`, questionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating question:', error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Create an answer for a question
  createAnswer: async (questionId, answerText) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.post(`${API_BASE_URL}qa/answers/${questionId}`, { answer: answerText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating answer:', error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Update question status (approve/reject)
  updateQuestionStatus: async (questionId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.patch(`${API_BASE_URL}qa/questions/${questionId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`Error updating question ${questionId} status:`, error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Update answer status (approve/reject)
  updateAnswerStatus: async (answerId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.patch(`${API_BASE_URL}qa/answers/${answerId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`Error updating answer ${answerId} status:`, error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Delete a question
  deleteQuestion: async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.delete(`${API_BASE_URL}qa/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`Error deleting question ${questionId}:`, error);
      }
      throw error.response?.data || error.message;
    }
  },

  // Delete an answer
  deleteAnswer: async (answerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const response = await axios.delete(`${API_BASE_URL}qa/answers/${answerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`Error deleting answer ${answerId}:`, error);
      }
      throw error.response?.data || error.message;
    }
  }
};

export default qaService;