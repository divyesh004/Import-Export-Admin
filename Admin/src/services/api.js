// src/api/qaApi.js

import axios from 'axios';
import { API_BASE_URL } from '../config/env';

// Get API base URL from .env file or fallback to localhost

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export the api instance as default
export default api;

// QA API methods
export const qaApi = {
  // Get all product questions
  getProductQuestions: async (params = {}) => {
    // Get user industry from localStorage if user is sub-admin
    const userRole = localStorage.getItem('userRole');
    const userIndustry = localStorage.getItem('userIndustry');
    
    // Add industry parameter for sub-admin users
    let queryParams = '';
    if (userRole === 'sub-admin' && userIndustry) {
      queryParams = `?industry=${encodeURIComponent(userIndustry)}`;
    }
    
    const response = await api.get(`qa/questions/all${queryParams}`);
    const questions = (response.data || []).map((q) => ({
      ...q,
      askedBy: q.users?.name || 'Unknown User',
    }));
    return {
      questions,
      total: questions.length,
    };
  },

  // Create a question
  createQuestion: async (data) => {
    const response = await api.post('qa/questions', data);
    return response.data;
  },

  // Delete a question by ID
  deleteQuestion: async (id) => {
    const response = await api.delete(`qa/questions/${id}`);
    return response.data;
  },

  // Get answers of a question
  getQuestionAnswers: async (questionId) => {
    const response = await api.get(`qa/answers/${questionId}`);
    return response.data;
  },

  // Create an answer for a question
  createAnswer: async (questionId, data) => {
    const response = await api.post(`qa/answers/${questionId}`, data);
    return response.data;
  },

  // Delete an answer by ID
  deleteAnswer: async (id) => {
    const response = await api.delete(`qa/answers/${id}`);
    return response.data;
  },
};