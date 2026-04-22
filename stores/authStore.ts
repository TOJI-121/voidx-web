import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('voidx_token', token);
    } else {
      localStorage.removeItem('voidx_token');
    }
    set({ accessToken: token });
  },

  logout: () => {
    localStorage.removeItem('voidx_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  initialize: async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('voidx_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        set({
          user: response.data.data,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem('voidx_token');
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch {
      localStorage.removeItem('voidx_token');
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));
