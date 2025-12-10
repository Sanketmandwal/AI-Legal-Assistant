import API from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },
  
  // ✅ Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
