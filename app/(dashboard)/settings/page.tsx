'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>
      
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Settings className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">Settings coming soon</p>
        <p className="text-sm mt-2">Manage your account preferences here</p>
      </div>
    </div>
  );
}
