import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dindin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('dindin_token');
      localStorage.removeItem('dindin_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  // Email/password signup
  emailSignup: async (email, password, name) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        name
      });
      return response.data;
    } catch (error) {
      console.error('Email signup error:', error);
      throw error;
    }
  },

  // Email/password login
  emailLogin: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  },

  // Google OAuth authentication
  googleAuth: async (token) => {
    try {
      const response = await apiClient.post('/auth/google', { token });
      return response.data;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  },
};

export const recipesAPI = {
  // Get recipes for discovery
  getRecipes: async (params = {}) => {
    try {
      const response = await apiClient.get('/recipes', { params });
      return response.data;
    } catch (error) {
      console.error('Get recipes error:', error);
      throw error;
    }
  },
  
  // Record a swipe on a recipe
  swipeRecipe: async (recipeId, direction) => {
    try {
      const response = await apiClient.post('/swipe', {
        recipe_id: recipeId,
        direction: direction
      });
      return response.data;
    } catch (error) {
      console.error('Swipe recipe error:', error);
      throw error;
    }
  }
};

export const matchesAPI = {
  // Get user's matches
  getMatches: async () => {
    try {
      const response = await apiClient.get('/matches');
      return response.data;
    } catch (error) {
      console.error('Get matches error:', error);
      throw error;
    }
  }
};

export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    try {
      const response = await apiClient.put('/profile', updates);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default apiClient;