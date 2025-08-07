// API Configuration for DinDin Frontend

// Environment-specific API base URLs
export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 10000,
  },
  production: {
    baseUrl: process.env.REACT_NATIVE_API_URL || 'https://your-production-api.com/api',
    timeout: 5000,
  },
  test: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 5000,
  }
};

// Get current environment
const getCurrentEnvironment = (): keyof typeof API_CONFIG => {
  if (__DEV__) return 'development';
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

// Export current configuration
export const currentApiConfig = API_CONFIG[getCurrentEnvironment()];

// API endpoints
export const ENDPOINTS = {
  // Recipe endpoints
  recipes: '/recipes',
  recipesPersonalized: '/recipes/personalized',
  recipesSearch: '/recipes/search',
  recipeById: (id: string) => `/recipes/${id}`,
  
  // Swipe endpoints
  swipes: '/swipes',
  swipeHistory: (userId: string) => `/swipes/history/${userId}`,
  
  // Match endpoints
  matches: (userId: string) => `/matches/${userId}`,
  
  // User endpoints
  users: '/users',
  userProfile: (userId: string) => `/users/${userId}`,
  
  // Auth endpoints
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh',
};

// Request headers
export const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add auth token if available and required
  if (includeAuth) {
    // This would be retrieved from your auth store
    const token = null; // TODO: Get from auth store
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// HTTP request wrapper with error handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${currentApiConfig.baseUrl}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

export default currentApiConfig;