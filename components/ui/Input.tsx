'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm text-gray-300 font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none text-sm transition-colors ${
            error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-gray-700 focus:border-gray-500'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
        {hint && !error && (
          <p className="text-gray-500 text-xs">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
