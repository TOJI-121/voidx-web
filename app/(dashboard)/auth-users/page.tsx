'use client'

import { useState } from 'react'
import { useProjects } from '@/lib/hooks/useProjects'
import {
  useProjectUsers,
  useDeleteProjectUser,
  useUpdateProjectUserRole
} from '@/lib/hooks/useAuthUsers'
import { formatDate } from '@/lib/utils'
import { Users, Shield, Trash2, Search, UserCheck, UserX } from 'lucide-react'
import { toast } from '@/stores/toastStore'

export default function AuthUsersPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: projectUsers, isLoading: usersLoading } = useProjectUsers(selectedProjectId || '')
  const deleteUser = useDeleteProjectUser()
  const updateRole = useUpdateProjectUserRole()

  const filteredUsers = projectUsers?.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      user.fullName?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Users size={24} className="text-white" />
        <div>
          <h1 className="text-2xl font-bold text-white">Auth Users</h1>
          <p className="text-gray-400 text-sm">Manage end-users registered to your projects</p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-4 mt-6">
        {/* Project Selector */}
        <select
          value={selectedProjectId || ''}
          onChange={(e) => {
            setSelectedProjectId(e.target.value || null)
            setSearchQuery('')
            setShowDeleteConfirm(null)
          }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm min-w-[12rem] focus:outline-none focus:border-gray-600"
        >
          <option value="">Select a project</option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* User Count Badge */}
        {selectedProjectId && projectUsers && (
          <span className="text-sm text-gray-400">{filteredUsers?.length || 0} users</span>
        )}
      </div>

      {/* Content Area */}
      {!selectedProjectId ? (
        // No project selected
        <div className="flex flex-col items-center justify-center py-24">
          <Users size={48} className="text-gray-600 mb-4" />
          <h3 className="text-white font-medium">Select a project</h3>
          <p className="text-gray-400 text-sm">Choose a project to view its registered users</p>
        </div>
      ) : usersLoading ? (
        // Loading state
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-800 rounded-xl h-16" />
          ))}
        </div>
      ) : !projectUsers || projectUsers.length === 0 ? (
        // No users
        <div className="flex flex-col items-center justify-center py-24">
          <UserX size={48} className="text-gray-600 mb-4" />
          <h3 className="text-white font-medium">No users yet</h3>
          <p className="text-gray-400 text-sm">Users will appear here when they register to your project</p>
        </div>
      ) : (
        // Users table
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-3">Last Login</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredUsers?.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors items-center"
            >
              {/* User Cell */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.fullName || 'No name'}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>

              {/* Role Cell */}
              <div className="col-span-2">
                <select
                  value={user.role}
                  onChange={(e) => {
                    updateRole.mutate(
                      {
                        projectId: selectedProjectId!,
                        userId: user.id,
                        role: e.target.value
                      },
                      {
                        onSuccess: () => toast.success('Role updated'),
                        onError: () => toast.error('Failed to update role')
                      }
                    )
                  }}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-gray-600"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Last Login Cell */}
              <div className="col-span-3">
                <p className="text-sm text-gray-400">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                </p>
              </div>

              {/* Joined Cell */}
              <div className="col-span-2">
                <p className="text-sm text-gray-400">{formatDate(user.createdAt)}</p>
              </div>

              {/* Actions Cell */}
              <div className="col-span-1">
                {showDeleteConfirm === user.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        deleteUser.mutate(
                          { projectId: selectedProjectId!, userId: user.id },
                          {
                            onSuccess: () => toast.success('User deleted'),
                            onError: () => toast.error('Failed to delete user')
                          }
                        )
                        setShowDeleteConfirm(null)
                      }}
                      className="text-red-400 text-xs hover:underline"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="text-gray-400 text-xs hover:underline"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(user.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Stats Row */}
          <div className="px-6 py-3 border-t border-gray-800 flex items-center gap-6 text-xs text-gray-500">
            <span>Total: {projectUsers?.length || 0} users</span>
            <span>Admins: {projectUsers?.filter((u) => u.role === 'admin').length || 0}</span>
            <span>Members: {projectUsers?.filter((u) => u.role === 'member').length || 0}</span>
          </div>
        </div>
      )}
    </div>
  )
}
