import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  type: ToastType
  message: string
  duration?: number
}

type ToastState = {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = toast.duration || 4000

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, duration)
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))

// Helper functions
export const toast = {
  success: (message: string) => {
    useToastStore.getState().addToast({ type: 'success', message })
  },
  error: (message: string) => {
    useToastStore.getState().addToast({ type: 'error', message })
  },
  warning: (message: string) => {
    useToastStore.getState().addToast({ type: 'warning', message })
  },
  info: (message: string) => {
    useToastStore.getState().addToast({ type: 'info', message })
  }
}
