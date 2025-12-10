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
  // login: async (credentials) => {
  //   try {
  //     const response = await API.post('/auth/login', credentials);
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data?.message || 'Login failed. Please check your credentials.';
  //   }
  // },
  login: async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock validation
  if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
    return {
      success: true,
      token: 'mock_token_' + Date.now(),
      user: {
        id: 'mock_id_123',
        name: 'Test User',
        email: credentials.email,
        phone: '9876543210',
        role: 'citizen'
      }
    };
  } else {
    throw 'Invalid email or password';
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


// TEMPORARY - Remove when backend is ready
// login: async (credentials) => {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 1500));
  
//   // Mock validation
//   if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
//     return {
//       success: true,
//       token: 'mock_token_' + Date.now(),
//       user: {
//         id: 'mock_id_123',
//         name: 'Test User',
//         email: credentials.email,
//         phone: '9876543210',
//         role: 'citizen'
//       }
//     };
//   } else {
//     throw 'Invalid email or password';
//   }
// },

// Email: test@example.com

// Password: password123