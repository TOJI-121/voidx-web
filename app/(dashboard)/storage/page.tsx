'use client'

import { useState } from 'react'
import { useProjects } from '@/lib/hooks/useProjects'
import {
  useBuckets,
  useFiles,
  useDeleteBucket,
  useDeleteFile,
  useStorageUsage,
  type Bucket
} from '@/lib/hooks/useStorage'
import { CreateBucketModal } from '@/components/features/storage/CreateBucketModal'
import { FileUploadModal } from '@/components/features/storage/FileUploadModal'
import { cn, formatBytes } from '@/lib/utils'
import {
  HardDrive,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Film,
  Music,
  File,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react'

export default function StoragePage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null)
  const [showCreateBucket, setShowCreateBucket] = useState(false)
  const [showUploadFile, setShowUploadFile] = useState(false)
  const [deleteConfirmBucketId, setDeleteConfirmBucketId] = useState<string | null>(null)
  const [deleteConfirmFileId, setDeleteConfirmFileId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: projects } = useProjects()
  const { data: buckets } = useBuckets(selectedProjectId || '')
  const { data: files } = useFiles(selectedProjectId || '', selectedBucket?.id || '')
  const { data: storageUsage } = useStorageUsage(selectedProjectId || '')
  const deleteBucket = useDeleteBucket()
  const deleteFile = useDeleteFile()

  const handleDeleteBucket = async (bucketId: string) => {
    if (!selectedProjectId) return
    await deleteBucket.mutateAsync({ projectId: selectedProjectId, bucketId })
    if (selectedBucket?.id === bucketId) {
      setSelectedBucket(null)
    }
    setDeleteConfirmBucketId(null)
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!selectedProjectId || !selectedBucket) return
    await deleteFile.mutateAsync({
      projectId: selectedProjectId,
      bucketId: selectedBucket.id,
      fileId
    })
    setDeleteConfirmFileId(null)
  }

  const getFileIcon = (mimeType: string, size: number = 20) => {
    const type = mimeType || ''
    if (type.startsWith('image/')) {
      return <ImageIcon size={size} className="text-blue-400" />
    }
    if (type.includes('pdf')) {
      return <FileText size={size} className="text-red-400" />
    }
    if (type.startsWith('video/')) {
      return <Film size={size} className="text-purple-400" />
    }
    if (type.startsWith('audio/')) {
      return <Music size={size} className="text-green-400" />
    }
    return <File size={size} className="text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardDrive size={24} className="text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Storage</h1>
            <p className="text-gray-400 text-sm">Manage files and buckets for your projects</p>
          </div>
        </div>

        {/* Project Selector */}
        <select
          value={selectedProjectId || ''}
          onChange={(e) => {
            setSelectedProjectId(e.target.value || null)
            setSelectedBucket(null)
          }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">Select a project</option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Usage Stats */}
      {selectedProjectId && storageUsage && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Files</p>
            <p className="text-2xl font-bold text-white">{storageUsage.totalFiles || 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Storage Used</p>
            <p className="text-2xl font-bold text-white">{(storageUsage.totalSizeMB || 0).toFixed(1)} MB</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Buckets</p>
            <p className="text-2xl font-bold text-white">{storageUsage.totalBuckets || 0}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {selectedProjectId ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left - Buckets */}
          <div className="col-span-4 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span className="font-medium text-white text-sm">Buckets</span>
              <button
                onClick={() => setShowCreateBucket(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            {!buckets || buckets.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No buckets yet</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {buckets.map((bucket) => (
                  <div key={bucket.id} className="relative group">
                    <button
                      onClick={() => setSelectedBucket(bucket)}
                      className={cn(
                        'w-full text-left p-4 hover:bg-gray-800/50 transition-colors',
                        selectedBucket?.id === bucket.id ? 'bg-gray-800' : ''
                      )}
                    >
                      <div className="flex items-center justify-between pr-8">
                        <div>
                          <p className="text-sm font-medium text-white">{bucket.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded',
                                bucket.isPublic
                                  ? 'bg-green-900/50 text-green-400'
                                  : 'bg-gray-700 text-gray-400'
                              )}
                            >
                              {bucket.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Delete Button */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {deleteConfirmBucketId === bucket.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeleteBucket(bucket.id)}
                            className="text-red-400 text-xs hover:underline"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmBucketId(null)}
                            className="text-gray-400 text-xs hover:underline"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmBucketId(bucket.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Files */}
          <div className="col-span-8">
            {!selectedBucket ? (
              <div className="flex flex-col items-center justify-center py-24 bg-gray-900 border border-gray-800 rounded-2xl">
                <HardDrive size={48} className="text-gray-600 mb-4" />
                <p className="text-white font-medium">Select a bucket</p>
                <p className="text-gray-400 text-sm">Choose a bucket to view its files</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{selectedBucket.name}</span>
                    {files && (
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                        {files.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'
                      )}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'
                      )}
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => setShowUploadFile(true)}
                      className="ml-2 px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {/* Files - Grid View */}
                {viewMode === 'grid' && files && (
                  <div className="p-4 grid grid-cols-3 gap-3">
                    {files.map((file) => (
                      <div key={file.id} className="bg-gray-800 rounded-xl p-3 group relative">
                        {/* Preview */}
                        <div className="aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                          {(file.mimeType || '').startsWith('image/') ? (
                            <img
                              src={`http://localhost:3001/api/storage/serve/${selectedProjectId}/${file.id}`}
                              alt={file.originalName || file.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = 'none'
                                ;(e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              {getFileIcon(file.mimeType || '', 32)}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <p className="text-xs text-white truncate">{file.originalName || file.name}</p>
                        <p className="text-xs text-gray-500">{formatBytes(file.sizeBytes || 0)}</p>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmFileId(file.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-900/80 rounded"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>

                        {/* Delete Confirm */}
                        {deleteConfirmFileId === file.id && (
                          <div className="absolute inset-0 bg-gray-900/90 rounded-xl flex flex-col items-center justify-center gap-2">
                            <p className="text-xs text-white">Delete?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-400 text-xs hover:underline"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmFileId(null)}
                                className="text-gray-400 text-xs hover:underline"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Files - List View */}
                {viewMode === 'list' && files && (
                  <div className="divide-y divide-gray-800">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors">
                        {getFileIcon(file.mimeType || '', 20)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{file.originalName || file.name}</p>
                          <p className="text-xs text-gray-400">
                            {formatBytes(file.sizeBytes || 0)} · {file.mimeType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`http://localhost:3001/api/storage/serve/${selectedProjectId}/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                          {deleteConfirmFileId === file.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-400 text-xs hover:underline"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmFileId(null)}
                                className="text-gray-400 text-xs hover:underline"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmFileId(file.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Files */}
                {files && files.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <File size={32} className="text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No files in this bucket</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-900 border border-gray-800 rounded-2xl">
          <HardDrive size={48} className="text-gray-600 mb-4" />
          <p className="text-white font-medium">Select a project</p>
          <p className="text-gray-400 text-sm">Choose a project to manage storage</p>
        </div>
      )}

      {/* Modals */}
      <CreateBucketModal
        isOpen={showCreateBucket}
        onClose={() => setShowCreateBucket(false)}
        projectId={selectedProjectId || ''}
      />
      <FileUploadModal
        isOpen={showUploadFile}
        onClose={() => setShowUploadFile(false)}
        projectId={selectedProjectId || ''}
        bucketId={selectedBucket?.id || ''}
      />
    </div>
  )
}
