'use client'

import { useState, useCallback } from 'react'
import { useProjects } from '@/lib/hooks/useProjects'
import { useTables } from '@/lib/hooks/useDatabase'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Zap,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code,
  Globe,
  Lock
} from 'lucide-react'

type Endpoint = {
  id: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  description: string
  table: string
  params: string
}

const methodColors = {
  GET: 'text-green-400 bg-green-950 border-green-800',
  POST: 'text-blue-400 bg-blue-950 border-blue-800',
  PATCH: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  DELETE: 'text-red-400 bg-red-950 border-red-800',
}

export default function ApiExplorerPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [manualApiKey, setManualApiKey] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [requestBody, setRequestBody] = useState('')
  const [requestParams, setRequestParams] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())

  const { data: projects } = useProjects()
  const { data: tables } = useTables(selectedProjectId || '')

  const endpoints: Endpoint[] = tables?.flatMap((table) => [
    {
      id: `GET-${table.name}`,
      method: 'GET',
      path: `/api/data/${table.name}`,
      description: `List all rows in ${table.displayName || table.name}`,
      table: table.name,
      params: '?page=1&limit=20&order_by=created_at&order_dir=desc'
    },
    {
      id: `GET-${table.name}-id`,
      method: 'GET',
      path: `/api/data/${table.name}/:id`,
      description: `Get a single row from ${table.displayName || table.name}`,
      table: table.name,
      params: ''
    },
    {
      id: `POST-${table.name}`,
      method: 'POST',
      path: `/api/data/${table.name}`,
      description: `Insert a new row into ${table.displayName || table.name}`,
      table: table.name,
      params: ''
    },
    {
      id: `PATCH-${table.name}-id`,
      method: 'PATCH',
      path: `/api/data/${table.name}/:id`,
      description: `Update a row in ${table.displayName || table.name}`,
      table: table.name,
      params: ''
    },
    {
      id: `DELETE-${table.name}-id`,
      method: 'DELETE',
      path: `/api/data/${table.name}/:id`,
      description: `Delete a row from ${table.displayName || table.name}`,
      table: table.name,
      params: ''
    },
  ]) || []

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName)
    } else {
      newExpanded.add(tableName)
    }
    setExpandedTables(newExpanded)
  }

  const handleRun = async () => {
    if (!manualApiKey) {
      setResponse(JSON.stringify({ error: 'Please enter your API key' }, null, 2))
      setResponseStatus(400)
      return
    }

    if (!selectedEndpoint) return

    setIsLoading(true)
    setResponse(null)

    try {
      const rowId = selectedEndpoint.path.includes(':id')
        ? prompt('Enter row ID:') || 'REPLACE_WITH_ID'
        : undefined

      const url = `http://localhost:3001${selectedEndpoint.path.replace(':id', rowId || ':id')}${
        selectedEndpoint.method === 'GET' ? requestParams || selectedEndpoint.params : ''
      }`

      const config: any = {
        method: selectedEndpoint.method,
        url,
        headers: { 'x-api-key': manualApiKey },
      }

      if ((selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PATCH') && requestBody) {
        try {
          config.data = JSON.parse(requestBody)
        } catch {
          setResponse(JSON.stringify({ error: 'Invalid JSON in request body' }, null, 2))
          setResponseStatus(400)
          setIsLoading(false)
          return
        }
        config.headers['Content-Type'] = 'application/json'
      }

      const res = await api.request(config)
      setResponse(JSON.stringify(res.data, null, 2))
      setResponseStatus(res.status)
    } catch (err: any) {
      setResponse(JSON.stringify(err.response?.data || { error: err.message }, null, 2))
      setResponseStatus(err.response?.status || 500)
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint)
    setRequestBody('')
    setRequestParams('')
    setResponse(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Zap size={24} className="text-white" />
        <div>
          <h1 className="text-2xl font-bold text-white">API Explorer</h1>
          <p className="text-gray-400 text-sm">Test your auto-generated REST API endpoints</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6 flex-wrap">
        {/* Project Selector */}
        <select
          value={selectedProjectId || ''}
          onChange={(e) => {
            setSelectedProjectId(e.target.value || null)
            setSelectedEndpoint(null)
            setResponse(null)
          }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">Select a project</option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        {/* API Key Input */}
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={manualApiKey}
            onChange={(e) => setManualApiKey(e.target.value)}
            placeholder="Paste voidx_... key"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-72"
          />
          {manualApiKey.startsWith('voidx_') && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              API Key ready
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Left Panel - Endpoints */}
        <div className="col-span-5 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <span className="font-medium text-white text-sm">Endpoints</span>
            {tables && (
              <span className="text-xs text-gray-500">{endpoints.length} endpoints</span>
            )}
          </div>

          {!selectedProjectId ? (
            <div className="p-8 text-center">
              <Globe size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a project</p>
            </div>
          ) : !manualApiKey ? (
            <div className="p-8 text-center">
              <Lock size={48} className="text-yellow-600 mx-auto mb-4" />
              <p className="text-gray-400">Add your API key to test endpoints</p>
            </div>
          ) : !tables || tables.length === 0 ? (
            <div className="p-8 text-center">
              <Code size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tables yet. Create tables in the Database section.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
              {tables.map((table) => {
                const tableEndpoints = endpoints.filter((e) => e.table === table.name)
                const isExpanded = expandedTables.has(table.name)

                return (
                  <div key={table.name} className="border-b border-gray-800 last:border-0">
                    <button
                      onClick={() => toggleTable(table.name)}
                      className="flex items-center gap-2 w-full p-3 hover:bg-gray-800/50 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                      <span className="font-medium text-white text-sm">
                        {table.displayName || table.name}
                      </span>
                      <span className="text-xs text-gray-500">{tableEndpoints.length} endpoints</span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-800">
                        {tableEndpoints.map((endpoint) => (
                          <button
                            key={endpoint.id}
                            onClick={() => handleEndpointSelect(endpoint)}
                            className={cn(
                              'w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/50 transition-colors',
                              selectedEndpoint?.id === endpoint.id ? 'bg-gray-800' : ''
                            )}
                          >
                            <span
                              className={cn(
                                'text-xs font-mono font-bold px-2 py-0.5 rounded border',
                                methodColors[endpoint.method]
                              )}
                            >
                              {endpoint.method}
                            </span>
                            <span className="text-sm text-gray-300">{endpoint.path}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Panel - Request/Response */}
        <div className="col-span-7 space-y-4">
          {!selectedEndpoint ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center">
              <Code size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400">Select an endpoint to test it</p>
            </div>
          ) : (
            <>
              {/* Request Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'text-xs font-mono font-bold px-2 py-0.5 rounded border',
                        methodColors[selectedEndpoint.method]
                      )}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <span className="text-white text-sm font-mono">{selectedEndpoint.path}</span>
                  </div>
                  <button
                    onClick={handleRun}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-white text-gray-950 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Play size={14} />
                    {isLoading ? 'Running...' : 'Run'}
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* URL Preview */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">URL</label>
                    <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-gray-300 break-all">
                      http://localhost:3001{selectedEndpoint.path}
                      {selectedEndpoint.method === 'GET'
                        ? requestParams || selectedEndpoint.params
                        : ''}
                    </div>
                  </div>

                  {/* Query Parameters (GET only) */}
                  {selectedEndpoint.method === 'GET' && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Query Parameters</label>
                      <textarea
                        value={requestParams}
                        onChange={(e) => setRequestParams(e.target.value)}
                        placeholder="?page=1&limit=20"
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-mono resize-none focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  )}

                  {/* Request Body (POST/PATCH only) */}
                  {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PATCH') && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Request Body (JSON)</label>
                      <textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder='{\n  "field": "value"\n}'
                        rows={6}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-mono resize-none focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  )}

                  {/* Headers Preview */}
                  <div className="bg-gray-800 rounded-lg p-3 text-xs font-mono space-y-1">
                    <p className="text-gray-500">// Headers sent automatically</p>
                    <p className="text-gray-400">
                      x-api-key:{' '}
                      {manualApiKey
                        ? manualApiKey.substring(0, 20) + '...'
                        : 'not set'}
                    </p>
                    <p className="text-gray-400">Content-Type: application/json</p>
                  </div>
                </div>
              </div>

              {/* Response Card */}
              {response && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">Response</span>
                      {responseStatus && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded font-mono',
                            responseStatus < 300
                              ? 'bg-green-950 text-green-400'
                              : responseStatus < 400
                              ? 'bg-yellow-950 text-yellow-400'
                              : 'bg-red-950 text-red-400'
                          )}
                        >
                          {responseStatus}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={copyResponse}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
                    {response}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
