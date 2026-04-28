'use client';

import { useAuthStore } from '@/stores/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              value={user?.fullName || ''}
              readOnly
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <div className="space-y-3">
          <button className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors">
            <p className="text-white font-medium">Change Password</p>
            <p className="text-gray-400 text-sm">Update your account password</p>
          </button>
          <button className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors">
            <p className="text-white font-medium">API Keys</p>
            <p className="text-gray-400 text-sm">Manage your API keys</p>
          </button>
        </div>
      </div>
    </div>
  );
}
