'use client'

import { useState } from 'react'
import { useCreateBucket } from '@/lib/hooks/useStorage'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { toast } from '@/stores/toastStore'

interface CreateBucketModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

export function CreateBucketModal({ isOpen, onClose, projectId }: CreateBucketModalProps) {
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState('')
  const createBucket = useCreateBucket()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.match(/^[a-z0-9_-]+$/)) {
      setError('Bucket name can only contain lowercase letters, numbers, hyphens, and underscores')
      return
    }

    try {
      await createBucket.mutateAsync({ projectId, name, isPublic })
      toast.success('Bucket created successfully!')
      setName('')
      setIsPublic(false)
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create bucket'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Create New Bucket</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Bucket Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Bucket Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-images"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              lowercase, letters, numbers, hyphens, underscores
            </p>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Public Bucket</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Anyone with the URL can access files
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={cn(
                'w-11 h-6 rounded-full transition-colors',
                isPublic ? 'bg-green-500' : 'bg-gray-600'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5',
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || createBucket.isPending}
              className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createBucket.isPending ? 'Creating...' : 'Create Bucket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
