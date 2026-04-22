'use client';

import { Users } from 'lucide-react';

export default function AuthUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Auth Users</h1>
      
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Users className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">User management coming soon</p>
        <p className="text-sm mt-2">Manage your project users here</p>
      </div>
    </div>
  );
}
