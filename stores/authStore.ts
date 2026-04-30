import { create } from 'zustand';
import Cookies from 'js-cookie';

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
  init: () => Promise<void>;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  init: async () => {
    if (typeof window === 'undefined') return;
    
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      
      // Set token first
      set({ token });
      
      // Try to get saved user from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          set({ user: parsed, isAuthenticated: true });
        } catch(e) {}
      }
      
      // Verify token with backend
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Token invalid');
      
      const data = await res.json();
      const rawUser = data.data;
      const normalizedUser = {
        id: rawUser.id,
        email: rawUser.email,
        fullName: rawUser.fullName || rawUser.full_name || '',
        createdAt: rawUser.createdAt || rawUser.created_at || '',
        isVerified: rawUser.isVerified || rawUser.is_verified || false,
      };
      set({ user: normalizedUser, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch(e) {
      // Token invalid - clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, token: null });
    } finally {
      set({ isLoading: false });
    }
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
      
      if (!data.data) {
        throw new Error('Invalid response payload from server');
      }
      
      const { accessToken, user } = data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      Cookies.set('voidx_token', accessToken, { expires: 7, path: '/' });
      
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
      
      if (!data.data) {
        throw new Error('Invalid response payload from server');
      }
      
      const { accessToken, user } = data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      Cookies.set('voidx_token', accessToken, { expires: 7, path: '/' });
      
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
    Cookies.remove('voidx_token', { path: '/' });
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    console.log('[AUTH] Logged out');
    window.location.href = '/login';
  },
}));
