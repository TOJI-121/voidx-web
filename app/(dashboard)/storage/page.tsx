'use client';

import { HardDrive } from 'lucide-react';

export default function StoragePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Storage</h1>
      
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <HardDrive className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">File storage coming soon</p>
        <p className="text-sm mt-2">Manage your buckets and files here</p>
      </div>
    </div>
  );
}
