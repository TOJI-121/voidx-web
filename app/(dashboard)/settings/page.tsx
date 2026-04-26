'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Key, Trash2, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import { toast } from '@/stores/toastStore'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'security'>('account')
  const { user, logout } = useAuthStore()

  // Profile state - initialized empty, synced via useEffect when user loads
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Delete account modal
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Sync user data when store updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
    }
  }, [user?.fullName, user?.email])

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true)
    setProfileError('')
    try {
      const response = await api.patch('/api/auth/profile', { 
        fullName: fullName.trim(), 
        email: email.trim() 
      })
      const updatedUser = response.data.data
      useAuthStore.getState().setUser(updatedUser)
      toast.success('Profile updated!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile'
      setProfileError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      const errorMsg = 'Passwords do not match'
      setPasswordError(errorMsg)
      toast.error(errorMsg)
      return
    }
    if (newPassword.length < 8) {
      const errorMsg = 'Password must be at least 8 characters'
      setPasswordError(errorMsg)
      toast.error(errorMsg)
      return
    }
    setIsUpdatingPassword(true)
    try {
      await api.patch('/api/auth/password', { 
        currentPassword, 
        newPassword 
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update password'
      setPasswordError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/api/auth/me')
    } catch (e) {
      console.error('Delete account error:', e)
    } finally {
      setShowDeleteAccountModal(false)
      localStorage.removeItem('voidx_token')
      useAuthStore.getState().logout()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-white" />
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your account and preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'account'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User size={16} />
          Account
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'security'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Key size={16} />
          Security
        </button>
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-1">Profile Information</h2>
            <p className="text-gray-400 text-sm mb-6">Update your name and email address</p>

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {profileError && (
                <p className="text-red-400 text-sm">{profileError}</p>
              )}

              <Button
                onClick={handleUpdateProfile}
                isLoading={isUpdatingProfile}
                disabled={!fullName || !email}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-6">
            <h2 className="font-semibold text-red-400 mb-1">Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-6">Irreversible and destructive actions</p>

            <div className="flex items-center justify-between p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
              <div>
                <p className="font-medium text-white text-sm">Delete Account</p>
                <p className="text-gray-400 text-xs mt-0.5">Permanently delete your account and all projects</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteAccountModal(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-1">Change Password</h2>
            <p className="text-gray-400 text-sm mb-6">Update your password to keep your account secure</p>

            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                hint="Minimum 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {passwordError && (
                <p className="text-red-400 text-sm">{passwordError}</p>
              )}

              <Button
                onClick={handleUpdatePassword}
                isLoading={isUpdatingPassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-1">Session</h2>
            <p className="text-gray-400 text-sm mb-6">Manage your active session</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <span className="bg-green-950 text-green-400 text-xs px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Email</span>
                <span className="text-sm text-white">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Account</span>
                <span className="text-sm text-white">VOID-X Platform User</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <Button variant="secondary" className="w-full" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
            <AlertTriangle className="text-red-400" size={20} />
            <p className="text-sm text-red-300">
              This action cannot be undone. All your projects, data, and API keys will be permanently deleted.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Type &quot;DELETE&quot; to confirm:
          </p>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
          />

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteAccountModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
