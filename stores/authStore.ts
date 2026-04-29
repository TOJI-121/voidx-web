import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  init: () => void;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  init: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
        console.log('[AUTH] Restored from localStorage');
        return;
      } catch (e) {
        console.error('[AUTH] Failed to parse user:', e);
      }
    }
    
    set({ isLoading: false });
    console.log('[AUTH] No stored session found');
  },

  login: async (email, password) => {
    try {
      console.log('[AUTH] Logging in...');
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }
      
      const { accessToken, user } = data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      console.log('[AUTH] Login successful');
      
      return true;
    } catch (error: any) {
      console.error('[AUTH] Login error:', error.message);
      throw error;
    }
  },

  register: async (email, password, fullName) => {
    try {
      console.log('[AUTH] Registering...');
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      
      const { accessToken, user } = data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      console.log('[AUTH] Register successful');
      
      return true;
    } catch (error: any) {
      console.error('[AUTH] Register error:', error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    console.log('[AUTH] Logged out');
    window.location.href = '/login';
  },
}));
