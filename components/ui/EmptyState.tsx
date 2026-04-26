import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-600" />
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 bg-white text-gray-950 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
