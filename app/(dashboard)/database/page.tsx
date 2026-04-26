'use client'

import { useState, useEffect } from 'react'
import { Database, Plus } from 'lucide-react'
import { Fragment } from 'react'
import { useProjects } from '@/lib/hooks/useProjects'
import { useApiKeys } from '@/lib/hooks/useProjects'
import { useTables, type Table } from '@/lib/hooks/useDatabase'
import { CreateTableModal } from '@/components/features/database/CreateTableModal'
import { TableDataGrid } from '@/components/features/database/TableDataGrid'

export default function DatabasePage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [manualApiKey, setManualApiKey] = useState('')

  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: tables, isLoading: tablesLoading } = useTables(selectedProjectId || '')
  const { data: apiKeys } = useApiKeys(selectedProjectId || '')

  // Auto-select first project on load
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])


  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(e.target.value)
    setSelectedTable(null)
    setManualApiKey('')
  }

  return (
    <>
    <div className="flex h-full gap-6">
      {/* Left Sidebar */}
      <div className="w-64 flex-col flex-shrink-0">
        {/* Project Selector */}
        {projectsLoading ? (
          <div className="h-10 bg-gray-800 rounded-lg animate-pulse mb-4" />
        ) : (
          <select
            value={selectedProjectId || ''}
            onChange={handleProjectChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-gray-500"
          >
            <option value="">Select a project</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}

        {/* API Key Input */}
        <div className="mt-3">
          <label className="text-xs text-gray-500 mb-1 block">API Key (for data access)</label>
          <input
            type="password"
            placeholder="Paste your voidx_... key"
            value={manualApiKey}
            onChange={(e) => setManualApiKey(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gray-500"
          />
          {/* API Key Validation Indicator */}
          {manualApiKey && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {manualApiKey.startsWith('voidx_') ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-green-400">Valid format</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-red-400">Should start with voidx_</span>
                </>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Generate an API key from the Projects page for this specific project
          </p>
        </div>

        {/* Tables List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <span className="text-sm font-medium text-white">Tables</span>
            <button
              onClick={() => {
                if (!selectedProjectId) {
                  alert('Please select a project first')
                  return
                }
                setShowCreateTable(true)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          {tablesLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !selectedProjectId ? (
            <p className="text-xs text-gray-500 p-3">Select a project first</p>
          ) : tables?.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No tables yet</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {tables?.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                    selectedTable?.id === table.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {table.displayName || table.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedProjectId ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Database size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400">Select a project to view its tables</p>
          </div>
        ) : !selectedTable ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Database size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400">Select a table from the left to view its data</p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Table Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">
                  {selectedTable.displayName || selectedTable.name}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedTable.accessMode === 'public'
                    ? 'bg-green-950 text-green-400'
                    : selectedTable.accessMode === 'authenticated'
                    ? 'bg-blue-950 text-blue-400'
                    : 'bg-yellow-950 text-yellow-400'
                }`}>
                  {selectedTable.accessMode}
                </span>
              </div>
              {manualApiKey && (
                <span className="text-xs text-gray-500">
                  Using API key: {manualApiKey.substring(0, 20)}...
                </span>
              )}
            </div>

            {/* Data Grid or Warning */}
            {manualApiKey ? (
              <TableDataGrid
                table={selectedTable}
                projectId={selectedProjectId}
                apiKey={manualApiKey}
              />
            ) : (
              <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-6">
                <p className="text-yellow-400">
                  Paste your API key above to view and edit table data.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>

    {/* Modals - Outside main div */}
    <CreateTableModal
      isOpen={showCreateTable}
      onClose={() => setShowCreateTable(false)}
      projectId={selectedProjectId || ''}
    />
  </>
  )
}
