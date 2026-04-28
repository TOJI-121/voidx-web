'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Database,
  Zap,
  HardDrive,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const mainNavItems = [
  { href: '/projects', icon: LayoutDashboard, label: 'Projects' },
  { href: '/database', icon: Database, label: 'Database' },
  { href: '/api-explorer', icon: Zap, label: 'API Explorer' },
  { href: '/storage', icon: HardDrive, label: 'Storage' },
  { href: '/auth-users', icon: Users, label: 'Auth Users' },
];

const settingsNavItem = { href: '/settings', icon: Settings, label: 'Settings' };

const pageTitles: Record<string, string> = {
  '/projects': 'Projects',
  '/database': 'Database',
  '/api-explorer': 'API Explorer',
  '/storage': 'Storage',
  '/auth-users': 'Auth Users',
  '/settings': 'Settings',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, initialize, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Add small delay to prevent race condition during auth initialization
    const timer = setTimeout(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-bold text-lg text-white">VOID-X</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider before Settings */}
          <div className="my-4 border-t border-gray-800" />

          <div className="space-y-1">
            {(() => {
              const isActive = pathname === settingsNavItem.href || pathname.startsWith(settingsNavItem.href);
              return (
                <Link
                  href={settingsNavItem.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <settingsNavItem.icon size={18} />
                  <span>{settingsNavItem.label}</span>
                </Link>
              );
            })()}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 truncate mb-3">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6">
          <span className="text-sm text-gray-300">{pageTitle}</span>
          <div className="flex-1"></div>
          <span className="text-sm text-gray-300">{user?.fullName}</span>
        </div>
        <div className="flex-1 overflow-auto bg-gray-950 p-6">{children}</div>
      </main>
    </div>
  );
}
