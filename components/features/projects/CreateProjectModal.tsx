'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCreateProject } from '@/lib/hooks/useProjects'
import { toast } from '@/stores/toastStore'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  
  const createProject = useCreateProject()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    try {
      await createProject.mutateAsync({ name: name.trim(), description: description.trim() })
      toast.success('Project created successfully!')
      setName('')
      setDescription('')
      onClose()
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Failed to create project'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="my-awesome-app"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <Input
            label="Description"
            placeholder="What is this project for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createProject.isPending}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
