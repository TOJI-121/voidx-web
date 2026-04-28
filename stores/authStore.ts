import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    if (!user) {
      set({ user: null, isAuthenticated: false })
      return
    }
    const normalizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName || (user as any).full_name || '',
      createdAt: user.createdAt || (user as any).created_at || '',
    }
    set({ user: normalizedUser, isAuthenticated: true })
    localStorage.setItem('voidx_user', JSON.stringify(normalizedUser))
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
    localStorage.removeItem('voidx_token')
    localStorage.removeItem('voidx_user')
    set({ user: null, accessToken: null, isAuthenticated: false })
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  initialize: async () => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('voidx_token')
    const savedUser = localStorage.getItem('voidx_user')
    
    console.log('[AUTH INIT] Token exists:', !!token)
    console.log('[AUTH INIT] User exists:', !!savedUser)

    if (!token) {
      console.log('[AUTH INIT] No token, setting unauthenticated')
      set({ isLoading: false, isAuthenticated: false })
      return
    }

    // Restore user from localStorage immediately
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        console.log('[AUTH INIT] Restored user from localStorage:', parsed.email)
        set({ user: parsed, isAuthenticated: true, accessToken: token, isLoading: false })
      } catch (e) {
        console.log('[AUTH INIT] Failed to parse user')
      }
    } else {
      set({ isLoading: false, isAuthenticated: true, accessToken: token })
    }

    // Then fetch fresh data from API
    try {
      const response = await api.get('/api/auth/me')
      if (response.data.success) {
        const rawUser = response.data.data
        const normalizedUser = {
          id: rawUser.id,
          email: rawUser.email,
          fullName: rawUser.fullName || rawUser.full_name || '',
          createdAt: rawUser.createdAt || rawUser.created_at || '',
        }
        get().setUser(normalizedUser)
        set({
          accessToken: token,
          isLoading: false,
        })
      } else {
        localStorage.removeItem('voidx_token')
        localStorage.removeItem('voidx_user')
        set({ isLoading: false, isAuthenticated: false, user: null })
      }
    } catch {
      localStorage.removeItem('voidx_token')
      localStorage.removeItem('voidx_user')
      set({ isLoading: false, isAuthenticated: false, user: null })
    }
  },
}));
