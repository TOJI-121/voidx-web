'use client'

import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onClose
}: {
  toast: { id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }
  onClose: () => void
}) {
  const iconMap = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    warning: <AlertTriangle size={20} className="text-yellow-400" />,
    info: <Info size={20} className="text-gray-400" />
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm animate-in slide-in-from-right-5',
        toast.type === 'success' && 'bg-green-950 border-green-800 text-green-300',
        toast.type === 'error' && 'bg-red-950 border-red-800 text-red-300',
        toast.type === 'warning' && 'bg-yellow-950 border-yellow-800 text-yellow-300',
        toast.type === 'info' && 'bg-gray-800 border-gray-700 text-gray-300'
      )}
    >
      {iconMap[toast.type]}
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}
