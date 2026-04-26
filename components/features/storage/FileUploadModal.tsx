'use client'

import { useState, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn, formatBytes } from '@/lib/utils'
import { X, Upload, File as FileIcon, Check } from 'lucide-react'
import { toast } from '@/stores/toastStore'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  bucketId: string
}

export function FileUploadModal({ isOpen, onClose, projectId, bucketId }: FileUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  if (!isOpen) return null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      await api.post(`/api/storage/${projectId}/buckets/${bucketId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setSuccess(true)
      toast.success('File uploaded successfully!')

      // Invalidate files query
      queryClient.invalidateQueries({ queryKey: ['files', projectId, bucketId] })

      // Close after delay
      setTimeout(() => {
        clearSelection()
        setSuccess(false)
        setIsUploading(false)
        setUploadProgress(0)
        onClose()
      }, 1500)
    } catch (err: any) {
      clearInterval(progressInterval)
      const errorMsg = err.response?.data?.error || 'Failed to upload file'
      setError(errorMsg)
      toast.error('Upload failed')
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Upload File</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
              isDragging ? 'border-white bg-gray-800' : 'border-gray-700 hover:border-gray-600'
            )}
          >
            <Upload size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 text-sm">Drag and drop a file here</p>
            <p className="text-gray-500 text-xs mt-1">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="p-3 bg-gray-800 rounded-xl flex items-center gap-3">
              <FileIcon size={20} className="text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {selectedFile.name.length > 40
                    ? selectedFile.name.slice(0, 37) + '...'
                    : selectedFile.name}
                </p>
                <p className="text-xs text-gray-400">{formatBytes(selectedFile.size)}</p>
              </div>
              <button
                onClick={clearSelection}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-950 border border-green-800 rounded-xl text-green-400 text-sm flex items-center gap-2">
              <Check size={16} />
              File uploaded successfully
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
