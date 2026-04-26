'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatDate, formatBytes } from '@/lib/utils'
import { type Project } from '@/lib/hooks/useProjects'
import { KeyRound, Trash2 } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
  onManageKeys: (project: Project) => void
}

export function ProjectCard({ project, onDelete, onManageKeys }: ProjectCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg truncate">{project.name}</h3>
          <p className="text-gray-400 text-sm mt-0.5">
            {project.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onManageKeys(project)}
            className="flex items-center gap-1"
          >
            <KeyRound size={14} />
            Keys
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
        <div>
          <p className="text-xs text-gray-500">Files</p>
          <p className="text-sm font-medium text-white">{project.storageFiles || 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Storage</p>
          <p className="text-sm font-medium text-white">{formatBytes(project.storageSizeBytes || 0)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-500">Created {formatDate(project.createdAt || (project as any).created_at)}</p>
        {project.isActive && (
          <span className="bg-green-950 text-green-400 text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="mt-4 p-4 bg-red-950 border border-red-800 rounded-xl">
          <p className="text-red-300 text-sm">
            Are you sure? This will delete all project data.
          </p>
          <div className="flex gap-2 mt-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => {
                onDelete(project.id)
                setShowDeleteConfirm(false)
              }}
            >
              Delete Project
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
