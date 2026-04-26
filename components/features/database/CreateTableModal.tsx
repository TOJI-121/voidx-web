'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCreateTable } from '@/lib/hooks/useDatabase'
import { Plus, X } from 'lucide-react'

interface CreateTableModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

const DATA_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'integer', label: 'Integer' },
  { value: 'float', label: 'Float' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'timestamp', label: 'Timestamp' },
  { value: 'uuid', label: 'UUID' },
  { value: 'json', label: 'JSON' },
]

type ColumnInput = {
  name: string
  dataType: string
  isRequired: boolean
  isUnique: boolean
}

export function CreateTableModal({ isOpen, onClose, projectId }: CreateTableModalProps) {
  const [tableName, setTableName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [columns, setColumns] = useState<ColumnInput[]>([])
  const [error, setError] = useState('')

  const createTable = useCreateTable()

  const addColumn = () => {
    setColumns([...columns, { name: '', dataType: 'text', isRequired: false, isUnique: false }])
  }

  const updateColumn = (index: number, field: keyof ColumnInput, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setError('')

    // Validate table name
    if (!tableName.match(/^[a-z0-9_]+$/)) {
      setError('Table name must be lowercase letters, numbers, and underscores only')
      return
    }

    // Validate columns
    const validColumns = columns.filter(c => c.name.trim())
    for (const col of validColumns) {
      if (!col.name.match(/^[a-z0-9_]+$/)) {
        setError(`Column "${col.name}" must be lowercase letters, numbers, and underscores only`)
        return
      }
    }

    try {
      await createTable.mutateAsync({
        projectId,
        tableData: {
          name: tableName,
          displayName: displayName || tableName,
          columns: validColumns.map(c => ({
            name: c.name,
            displayName: c.name,
            dataType: c.dataType,
            isRequired: c.isRequired,
            isUnique: c.isUnique
          }))
        }
      })
      setTableName('')
      setDisplayName('')
      setColumns([])
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create table')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Table" size="lg">
      <div className="space-y-6">
        {/* Table Info */}
        <div className="space-y-4">
          <Input
            label="Table Name"
            placeholder="products"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            hint="lowercase, letters, numbers, underscores only"
          />
          <Input
            label="Display Name"
            placeholder="Products"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* Columns */}
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Columns</h3>
          <p className="text-xs text-gray-500 mb-3">
            System columns (id, created_at, updated_at, owner_id) are added automatically
          </p>

          <div className="space-y-2">
            {columns.map((column, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                <input
                  type="text"
                  placeholder="column_name"
                  value={column.name}
                  onChange={(e) => updateColumn(index, 'name', e.target.value)}
                  className="w-32 bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gray-500"
                />
                <select
                  value={column.dataType}
                  onChange={(e) => updateColumn(index, 'dataType', e.target.value)}
                  className="w-32 bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gray-500"
                >
                  {DATA_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={column.isRequired}
                    onChange={(e) => updateColumn(index, 'isRequired', e.target.checked)}
                    className="rounded border-gray-600"
                  />
                  Required
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={column.isUnique}
                    onChange={(e) => updateColumn(index, 'isUnique', e.target.checked)}
                    className="rounded border-gray-600"
                  />
                  Unique
                </label>
                <button
                  onClick={() => removeColumn(index)}
                  className="ml-auto text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addColumn}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mt-3 transition-colors"
          >
            <Plus size={16} />
            Add Column
          </button>
        </div>

        {/* Error & Actions */}
        {error && (
          <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={createTable.isPending}>
            Create Table
          </Button>
        </div>
      </div>
    </Modal>
  )
}
