import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Column = {
  id: string
  name: string
  displayName: string
  dataType: string
  isRequired: boolean
  isUnique: boolean
  defaultValue: string | null
  orderIndex: number
}

export type Table = {
  id: string
  name: string
  displayName: string
  description: string
  isPublic: boolean
  accessMode: string
  columns: Column[]
  createdAt: string
}

export type Row = Record<string, unknown>

export function useTables(projectId: string) {
  return useQuery({
    queryKey: ['tables', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/tables`)
      return res.data.data as Table[]
    },
    enabled: !!projectId
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, tableData }: { projectId: string, tableData: Record<string, unknown> }) => {
      const res = await api.post(`/api/projects/${projectId}/tables`, tableData)
      return res.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', variables.projectId] })
    }
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, tableId }: { projectId: string, tableId: string }) => {
      await api.delete(`/api/projects/${projectId}/tables/${tableId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', variables.projectId] })
    }
  })
}

export function useRows(projectId: string, tableName: string, apiKey: string) {
  return useQuery({
    queryKey: ['rows', projectId, tableName],
    queryFn: async () => {
      const res = await api.get(`/api/data/${tableName}`, {
        headers: { 
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })
      return res.data.data as { rows: Row[], total: number, page: number, totalPages: number }
    },
    enabled: !!projectId && !!tableName && !!apiKey && apiKey.startsWith('voidx_'),
    retry: false
  })
}

export function useInsertRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tableName, data, apiKey }: { tableName: string, data: Record<string, unknown>, apiKey: string, projectId: string }) => {
      const res = await api.post(`/api/data/${tableName}`, data, {
        headers: { 'x-api-key': apiKey }
      })
      return res.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rows', variables.projectId, variables.tableName] })
    }
  })
}

export function useUpdateRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tableName, rowId, data, apiKey }: { tableName: string, rowId: string, data: Record<string, unknown>, apiKey: string }) => {
      const res = await api.patch(`/api/data/${tableName}/${rowId}`, data, {
        headers: { 'x-api-key': apiKey }
      })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rows'] })
    }
  })
}

export function useDeleteRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tableName, rowId, apiKey }: { tableName: string, rowId: string, apiKey: string, projectId: string }) => {
      await api.delete(`/api/data/${tableName}/${rowId}`, {
        headers: { 'x-api-key': apiKey }
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rows', variables.projectId, variables.tableName] })
    }
  })
}
