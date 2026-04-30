import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Bucket = {
  id: string
  name: string
  isPublic: boolean
  maxFileSizeBytes: number
  createdAt: string
  fileCount?: number
}

export type StorageFile = {
  id: string
  name: string
  originalName: string
  mimeType: string
  sizeBytes: number
  isPublic: boolean
  createdAt: string
}

interface RawBucket {
  id: string;
  name: string;
  isPublic?: boolean;
  is_public?: boolean;
  maxFileSizeBytes?: number;
  max_file_size_bytes?: number;
  createdAt?: string;
  created_at?: string;
  fileCount?: number;
  file_count?: number;
  [key: string]: unknown;
}

interface RawStorageFile {
  id: string;
  name: string;
  originalName?: string;
  original_name?: string;
  mimeType?: string;
  mime_type?: string;
  sizeBytes?: number;
  size_bytes?: number;
  isPublic?: boolean;
  is_public?: boolean;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
}

export function useBuckets(projectId: string) {
  return useQuery({
    queryKey: ['buckets', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/storage/${projectId}/buckets`)
      return res.data.data.map((b: RawBucket) => ({
        ...b,
        isPublic: b.isPublic ?? b.is_public ?? false,
        maxFileSizeBytes: b.maxFileSizeBytes || b.max_file_size_bytes || 52428800,
        createdAt: b.createdAt || b.created_at || '',
        fileCount: b.fileCount || b.file_count || 0,
      })) as Bucket[]
    },
    enabled: !!projectId
  })
}

export function useCreateBucket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, name, isPublic }: { projectId: string; name: string; isPublic: boolean }) => {
      const res = await api.post(`/api/storage/${projectId}/buckets`, { name, isPublic })
      return res.data.data as Bucket
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buckets', variables.projectId] })
    }
  })
}

export function useDeleteBucket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, bucketId }: { projectId: string; bucketId: string }) => {
      await api.delete(`/api/storage/${projectId}/buckets/${bucketId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buckets', variables.projectId] })
    }
  })
}

export function useFiles(projectId: string, bucketId: string) {
  return useQuery({
    queryKey: ['files', projectId, bucketId],
    queryFn: async () => {
      const res = await api.get(`/api/storage/${projectId}/buckets/${bucketId}/files`)
      return res.data.data.map((f: RawStorageFile) => ({
        ...f,
        originalName: f.originalName || f.original_name || f.name,
        mimeType: f.mimeType || f.mime_type || 'application/octet-stream',
        sizeBytes: f.sizeBytes || f.size_bytes || 0,
        isPublic: f.isPublic ?? f.is_public ?? false,
        createdAt: f.createdAt || f.created_at || '',
      })) as StorageFile[]
    },
    enabled: !!projectId && !!bucketId
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, bucketId, fileId }: { projectId: string; bucketId: string; fileId: string }) => {
      await api.delete(`/api/storage/${projectId}/buckets/${bucketId}/files/${fileId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files', variables.projectId, variables.bucketId] })
    }
  })
}

export function useStorageUsage(projectId: string) {
  return useQuery({
    queryKey: ['storageUsage', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/storage/${projectId}/usage`)
      return res.data.data
    },
    enabled: !!projectId
  })
}
