'use client'

import { useState } from 'react'
import { Plus, Database } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/features/projects/ProjectCard'
import { CreateProjectModal } from '@/components/features/projects/CreateProjectModal'
import { ApiKeyModal } from '@/components/features/projects/ApiKeyModal'
import { useProjects, useDeleteProject, type Project } from '@/lib/hooks/useProjects'
import { toast } from '@/stores/toastStore'

export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const { data: projects, isLoading, error } = useProjects()
  const deleteProject = useDeleteProject()

  const handleManageKeys = (project: Project) => {
    setSelectedProject(project)
    setShowKeyModal(true)
  }

  const handleCloseKeyModal = () => {
    setShowKeyModal(false)
    setSelectedProject(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your VOID-X projects</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-950 border border-red-800 rounded-2xl p-6">
          <p className="text-red-400">Failed to load projects. Please try again.</p>
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <Database className="text-gray-600" size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">No projects yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first project to get started</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-2" />
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={async (id) => {
                try {
                  await deleteProject.mutateAsync(id)
                  toast.success('Project deleted')
                } catch (err: any) {
                  toast.error('Failed to delete project')
                }
              }}
              onManageKeys={handleManageKeys}
            />
          ))}
        </div>
      )}

      <CreateProjectModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
      
      {selectedProject && (
        <ApiKeyModal
          isOpen={showKeyModal}
          onClose={handleCloseKeyModal}
          project={selectedProject}
        />
      )}
    </div>
  )
}
