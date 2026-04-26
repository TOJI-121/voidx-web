import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Project = {
  id: string
  name: string
  description: string
  isActive: boolean
  storageFiles: number
  storageSizeBytes: number
  createdAt: string
  updatedAt: string
}

export type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  key?: string  // Full key, only present when first generated
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
}

export type CreateProjectData = {
  name: string
  description?: string
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/api/projects')
      return res.data.data.map((p: any) => ({
        ...p,
        createdAt: p.createdAt || p.created_at || new Date().toISOString(),
        updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
        storageFiles: Number(p.storageFiles ?? p.storage_files ?? 0),
        storageSizeBytes: Number(p.storageSizeBytes ?? p.storage_size_bytes ?? p.storagefilesbytes ?? 0),
      })) as Project[]
    }
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const res = await api.post('/api/projects', data)
      return res.data.data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/api/projects/${projectId}`)
      return projectId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useApiKeys(projectId: string) {
  return useQuery({
    queryKey: ['apiKeys', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/keys`)
      return res.data.data as ApiKey[]
    },
    enabled: !!projectId
  })
}

export function useGenerateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, name }: { projectId: string, name: string }) => {
      const res = await api.post(`/api/projects/${projectId}/keys`, { name })
      return res.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', variables.projectId] })
    }
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, keyId }: { projectId: string, keyId: string }) => {
      await api.patch(`/api/projects/${projectId}/keys/${keyId}/revoke`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', variables.projectId] })
    }
  })
}
