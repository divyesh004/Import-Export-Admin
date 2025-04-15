// Environment variables configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';

// App Information
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Import Export Admin Panel';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

// Feature Flags
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

export const getApiConfig = (token) => {
  return {
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };
};