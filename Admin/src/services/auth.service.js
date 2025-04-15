import { API_BASE_URL } from '../config/env';

const API_URL = API_BASE_URL;

export const getUsersByRole = async (role) => {
  try {
    const response = await fetch(`${API_URL}auth/role/${role}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store JWT token in localStorage
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const approveSeller = async (userId) => {
  try {
    const response = await fetch(`${API_URL}auth/approve/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve seller');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const toggleUserBan = async (userId, isBanned) => {
  try {
    const response = await fetch(`${API_URL}auth/ban/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        is_banned: isBanned
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle user ban status');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};
