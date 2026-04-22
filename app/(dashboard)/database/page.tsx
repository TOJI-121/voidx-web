'use client';

import { Database } from 'lucide-react';

export default function DatabasePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Database</h1>
      
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Database className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">Database designer coming soon</p>
        <p className="text-sm mt-2">Manage your tables and schemas here</p>
      </div>
    </div>
  );
}
