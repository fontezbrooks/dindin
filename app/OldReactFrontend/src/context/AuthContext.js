import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('dindin_user');
        const storedToken = localStorage.getItem('dindin_token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear corrupted auth data
        localStorage.removeItem('dindin_user');
        localStorage.removeItem('dindin_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signupWithEmail = async (email, password, name) => {
    setLoading(true);
    try {
      const authResponse = await authAPI.emailSignup(email, password, name);
      
      // Store the JWT token and user data
      localStorage.setItem('dindin_token', authResponse.access_token);
      localStorage.setItem('dindin_user', JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
      
      // Redirect to discover page
      setTimeout(() => {
        window.location.href = '/discover';
      }, 100);
      
      return authResponse.user;
      
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const authResponse = await authAPI.emailLogin(email, password);
      
      // Store the JWT token and user data
      localStorage.setItem('dindin_token', authResponse.access_token);
      localStorage.setItem('dindin_user', JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
      
      // Redirect to discover page
      setTimeout(() => {
        window.location.href = '/discover';
      }, 100);
      
      return authResponse.user;
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would use Google OAuth SDK
      // For now, we'll simulate the Google OAuth flow
      
      // This is a mock implementation - in production you would:
      // 1. Use Google OAuth SDK to get the access token
      // 2. Send that token to our backend for verification
      
      // For demo purposes, let's create a mock Google token response
      const mockGoogleToken = 'mock-google-access-token';
      
      // Call our backend API with the Google token
      const authResponse = await authAPI.googleAuth(mockGoogleToken);
      
      // Store the JWT token and user data
      localStorage.setItem('dindin_token', authResponse.access_token);
      localStorage.setItem('dindin_user', JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
      
      // Redirect to discover page
      setTimeout(() => {
        window.location.href = '/discover';
      }, 100);
      
      return authResponse.user;
      
    } catch (error) {
      console.error('Google login failed:', error);
      
      // Fallback to mock user for development
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: 'demo@dindin.com',
        avatar: null,
        dietary_restrictions: [],
        cuisine_preferences: [],
        auth_method: 'google'
      };
      
      // Create a mock JWT token for development
      const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwibmFtZSI6IkRlbW8gVXNlciIsImVtYWlsIjoiZGVtb0BkaW5kaW4uY29tIn0.mock-signature';
      
      localStorage.setItem('dindin_token', mockToken);
      localStorage.setItem('dindin_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      console.log('Using mock authentication for development');
      
      // Force redirect to discover page
      setTimeout(() => {
        window.location.href = '/discover';
      }, 100);
      
      return mockUser;
      
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dindin_user');
    localStorage.removeItem('dindin_token');
    window.location.href = '/';
  };

  const updateUserProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('dindin_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};