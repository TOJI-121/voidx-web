'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatBytes } from '@/lib/utils';
import { Plus, Folder } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  storageFiles: number;
  storageSizeBytes: number;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Folder className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  project.isActive
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {project.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {project.description || 'No description'}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{project.storageFiles} files</span>
              <span>{formatBytes(project.storageSizeBytes)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
