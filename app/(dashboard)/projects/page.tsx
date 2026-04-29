'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Key } from 'lucide-react';
import api from '@/lib/api';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showKeys, setShowKeys] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/projects');
      setProjects(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/projects', {
        name: newProjectName,
        description: newProjectDesc
      });
      setNewProjectName('');
      setNewProjectDesc('');
      setShowCreate(false);
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const fetchApiKeys = async (projectId: string) => {
    try {
      const res = await api.get(`/api/projects/${projectId}/keys`);
      setApiKeys(res.data.data || []);
      setSelectedProject(projectId);
      setShowKeys(true);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const generateApiKey = async () => {
    if (!selectedProject) return;
    try {
      const res = await api.post(`/api/projects/${selectedProject}/keys`);
      setGeneratedKey(res.data.data.key);
      fetchApiKeys(selectedProject);
    } catch (error) {
      console.error('Failed to generate API key:', error);
      alert('Failed to generate API key');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Your Projects</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 mb-4">No projects yet</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-blue-400 hover:text-blue-300"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between items-start"
            >
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-1">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                )}
                <p className="text-gray-500 text-xs">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchApiKeys(project.id)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                  title="API Keys"
                >
                  <Key size={18} />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  minLength={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="My Awesome Project"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Keys Modal */}
      {showKeys && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">API Keys</h3>
              <button
                onClick={() => {
                  setShowKeys(false);
                  setGeneratedKey(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {generatedKey && (
              <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm font-medium mb-2">
                  Copy this key now! It will never be shown again.
                </p>
                <code className="block bg-gray-950 text-green-400 px-3 py-2 rounded text-sm break-all font-mono">
                  {generatedKey}
                </code>
              </div>
            )}

            <button
              onClick={generateApiKey}
              className="w-full mb-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Key size={18} />
              Generate New Key
            </button>

            {apiKeys.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No API keys yet</p>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-white font-mono text-sm">{key.key_prefix}...</p>
                      <p className="text-gray-400 text-xs">{key.name}</p>
                      <p className="text-gray-500 text-xs">
                        {key.is_active ? 'Active' : 'Revoked'} • Created {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {key.is_active && (
                      <button
                        onClick={async () => {
                          try {
                            await api.patch(`/api/projects/${selectedProject}/keys/${key.id}/revoke`);
                            fetchApiKeys(selectedProject);
                          } catch (error) {
                            alert('Failed to revoke key');
                          }
                        }}
                        className="text-xs px-3 py-1 bg-red-950 text-red-400 hover:bg-red-900 rounded transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
