'use client';

export default function DatabasePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Database</h1>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Database Tables</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div>
              <p className="text-white font-medium">users</p>
              <p className="text-gray-400 text-sm">User accounts and profiles</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              View Data
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div>
              <p className="text-white font-medium">projects</p>
              <p className="text-gray-400 text-sm">User projects</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              View Data
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div>
              <p className="text-white font-medium">forms</p>
              <p className="text-gray-400 text-sm">Form definitions</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              View Data
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div>
              <p className="text-white font-medium">submissions</p>
              <p className="text-gray-400 text-sm">Form submissions</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              View Data
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Database Info</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Type</p>
            <p className="text-white">PostgreSQL</p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <p className="text-green-400">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
