'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/projects');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[LOGIN] Form submitted, preventDefault called');
    setError('');
    setIsLoading(true);
    console.log('[LOGIN] Submitting:', email);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      console.log('[LOGIN] Response:', response.data);

      const { accessToken, user } = response.data.data;
      console.log('[LOGIN] Token:', accessToken ? 'received' : 'missing');
      console.log('[LOGIN] User:', user);
      
      // Set auth state first
      useAuthStore.getState().setAccessToken(accessToken);
      useAuthStore.getState().setUser(user);
      
      console.log('[LOGIN] Success, navigating to /projects');
      alert('Login successful! Redirecting...');
      // Hard redirect to dashboard
      window.location.href = '/projects';
    } catch (err: any) {
      console.error('[LOGIN] Error:', err?.response?.data || err?.message);
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl">⚡</span>
            <span className="text-2xl font-bold text-white">VOID-X</span>
          </div>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-white text-gray-950 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-white hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
