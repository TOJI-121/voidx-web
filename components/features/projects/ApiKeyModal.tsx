'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useApiKeys, useGenerateApiKey, useRevokeApiKey, type Project } from '@/lib/hooks/useProjects'
import { formatDate } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'
import { toast } from '@/stores/toastStore'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
}

export function ApiKeyModal({ isOpen, onClose, project }: ApiKeyModalProps) {
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: apiKeys, isLoading } = useApiKeys(project.id)
  const generateKey = useGenerateApiKey()
  const revokeKey = useRevokeApiKey()

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return
    
    try {
      const result = await generateKey.mutateAsync({ projectId: project.id, name: newKeyName.trim() })
      setGeneratedKey(result.key)
      setNewKeyName('')
      toast.success('API key generated! Save it now.')
    } catch (err: any) {
      console.error('Failed to generate key:', err)
      toast.error('Failed to generate API key')
    }
  }

  const handleCopy = async () => {
    if (!generatedKey) return
    await navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return
    
    try {
      await revokeKey.mutateAsync({ projectId: project.id, keyId })
      toast.success('API key revoked')
    } catch (err: any) {
      console.error('Failed to revoke key:', err)
      toast.error('Failed to revoke API key')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API Keys" size="lg">
      <p className="text-gray-400 text-sm mb-4">{project.name}</p>

      {generatedKey && (
        <div className="bg-green-950 border border-green-800 rounded-xl p-4 mb-4">
          <p className="text-green-400 text-sm mb-2">⚠️ Save this key now. It will never be shown again.</p>
          <code className="text-green-400 font-mono text-xs break-all block bg-green-900/50 rounded-lg p-3 mb-3">
            {generatedKey}
          </code>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? ' Copied!' : ' Copy'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setGeneratedKey(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-white mb-3">Generate New Key</p>
        <div className="flex gap-3">
          <Input
            placeholder="e.g. Production Key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleGenerate} 
            isLoading={generateKey.isPending}
            disabled={!newKeyName.trim()}
          >
            Generate
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-white mb-3">Your API Keys</p>
        
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : apiKeys?.length === 0 ? (
          <p className="text-gray-500 text-sm">No API keys yet. Generate one above.</p>
        ) : (
          <div className="space-y-3">
            {apiKeys?.map((key) => (
              <div key={key.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{key.name}</p>
                  <p className="font-mono text-gray-400 text-xs">{key.keyPrefix}...</p>
                  <p className="text-gray-500 text-xs">
                    {key.lastUsedAt ? `Last used ${formatDate(key.lastUsedAt)}` : 'Never used'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    key.isActive ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {key.isActive ? 'Active' : 'Revoked'}
                  </span>
                  {key.isActive && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRevoke(key.id)}
                      isLoading={revokeKey.isPending}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
