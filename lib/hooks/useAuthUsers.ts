import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type ProjectUser = {
  id: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export function useProjectUsers(projectId: string) {
  return useQuery({
    queryKey: ['projectUsers', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/dashboard/${projectId}/users`)
      return res.data.data.map((u: any) => ({
        ...u,
        fullName: u.fullName || u.full_name || '',
        isActive: u.isActive ?? u.is_active ?? true,
        lastLoginAt: u.lastLoginAt || u.last_login_at || null,
        createdAt: u.createdAt || u.created_at || '',
      })) as ProjectUser[]
    },
    enabled: !!projectId
  })
}

export function useDeleteProjectUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      await api.delete(`/api/dashboard/${projectId}/users/${userId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectUsers', variables.projectId] })
    }
  })
}

export function useUpdateProjectUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, userId, role }: { projectId: string; userId: string; role: string }) => {
      const res = await api.patch(`/api/dashboard/${projectId}/users/${userId}/role`, { role })
      return res.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectUsers', variables.projectId] })
    }
  })
}
