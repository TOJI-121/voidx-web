'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRows, useInsertRow, useDeleteRow, type Table } from '@/lib/hooks/useDatabase'
import { Trash2, Plus } from 'lucide-react'
import { truncate } from '@/lib/utils'

interface TableDataGridProps {
  table: Table
  projectId: string
  apiKey: string
}

const SYSTEM_COLUMNS = ['id', 'created_at', 'updated_at', 'owner_id']

export function TableDataGrid({ table, projectId, apiKey }: TableDataGridProps) {
  const [showInsertRow, setShowInsertRow] = useState(false)
  const [newRowData, setNewRowData] = useState<Record<string, string>>({})

  const { data, isLoading, error } = useRows(projectId, table.name, apiKey)
  const insertRow = useInsertRow()
  const deleteRow = useDeleteRow()

  const rows = data?.rows || []

  const handleInsert = async () => {
    try {
      await insertRow.mutateAsync({
        tableName: table.name,
        data: newRowData,
        apiKey,
        projectId
      })
      setNewRowData({})
      setShowInsertRow(false)
    } catch (err: any) {
      console.error('Failed to insert row:', err)
    }
  }

  const handleDelete = async (rowId: string) => {
    if (!confirm('Are you sure you want to delete this row?')) return
    try {
      await deleteRow.mutateAsync({
        tableName: table.name,
        rowId,
        apiKey,
        projectId
      })
    } catch (err: any) {
      console.error('Failed to delete row:', err)
    }
  }

  const formatCellValue = (value: any, dataType?: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500 italic">null</span>
    }
    if (typeof value === 'boolean') {
      return value ? (
        <span className="bg-green-950 text-green-400 text-xs px-2 py-0.5 rounded-full">true</span>
      ) : (
        <span className="bg-red-950 text-red-400 text-xs px-2 py-0.5 rounded-full">false</span>
      )
    }
    if (dataType === 'json' && typeof value === 'object') {
      return <span className="text-gray-400">{truncate(JSON.stringify(value), 50)}</span>
    }
    return <span className="text-gray-300">{truncate(String(value), 50)}</span>
  }

  // Get user columns (exclude system columns)
  const userColumns = table.columns.filter(col => !SYSTEM_COLUMNS.includes(col.name))
  const allColumns = [...table.columns]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-950 border border-red-800 rounded-xl p-4">
        <p className="text-red-400 text-sm font-medium">Failed to load table data</p>
        <p className="text-red-500 text-xs mt-1">
          {(error as any)?.response?.data?.error || 'Check that your API key belongs to this project'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{table.displayName || table.name}</h3>
          <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
            {rows.length} rows
          </span>
        </div>
        <Button onClick={() => setShowInsertRow(true)} size="sm">
          <Plus size={16} className="mr-1" />
          Insert Row
        </Button>
      </div>

      {/* Empty State */}
      {rows.length === 0 && !showInsertRow && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400">No rows yet. Insert your first row.</p>
        </div>
      )}

      {/* Data Table */}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-600" />
                </th>
                {allColumns.map((column) => (
                  <th key={column.id} className="px-4 py-3 text-left text-gray-300 font-medium whitespace-nowrap">
                    {column.displayName || column.name}
                    <span className="text-gray-500 text-xs ml-1">({column.dataType})</span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || index} className="bg-gray-900 hover:bg-gray-800/50 border-t border-gray-800">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-600" />
                  </td>
                  {allColumns.map((column) => (
                    <td key={column.id} className="px-4 py-3 whitespace-nowrap">
                      {formatCellValue(row[column.name], column.dataType)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insert Row Form */}
      {showInsertRow && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mt-4">
          <h4 className="text-sm font-medium text-white mb-3">Insert New Row</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userColumns.map((column) => (
              <div key={column.id}>
                <label className="block text-xs text-gray-400 mb-1">
                  {column.displayName || column.name}
                </label>
                <Input
                  placeholder={column.dataType}
                  value={newRowData[column.name] || ''}
                  onChange={(e) => setNewRowData({ ...newRowData, [column.name]: e.target.value })}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowInsertRow(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleInsert} isLoading={insertRow.isPending}>
              Insert Row
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
