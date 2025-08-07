import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  preferences: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication - in real app this would be an API call
      if (email && password) {
        const mockUser: User = {
          id: "1",
          name: "Alex Morgan",
          email: email,
          preferences: ["Italian", "Healthy", "Quick"],
        };

        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
      return false;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock registration - in real app this would be an API call
      if (name && email && password) {
        const mockUser: User = {
          id: "1",
          name: name,
          email: email,
          preferences: [],
        };

        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      } else {
        throw new Error("Invalid registration data");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Signup failed",
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
