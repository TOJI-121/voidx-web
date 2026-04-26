'use client'

import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-16 h-16 bg-red-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md">{error.message}</p>
        <button
          onClick={reset}
          className="bg-white text-gray-950 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
