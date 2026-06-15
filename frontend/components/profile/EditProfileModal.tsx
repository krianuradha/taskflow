'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { X, Camera, Loader2 } from 'lucide-react'

export function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  const [fullname, setFullname] = useState('')
  const [username, setUsername] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => setMounted(true), [])

  // Re-sync fields every time the modal opens with fresh user data
  useEffect(() => {
    if (open && user) {
      setFullname(user.fullname || user.name || '')
      setUsername(user.username || '')
      setAvatarPreview(user.avatarUrl || '')
    }
  }, [open, user])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const updateProfile = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/v1/auth/update-profile', { fullname, username })
      return res.data.data
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['current-user'], updatedUser)
      toast.success('Profile updated successfully')
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    }
  })

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/api/v1/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30s timeout so it never hangs forever
      })
      return res.data.data
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['current-user'], updatedUser)
      setAvatarPreview(updatedUser.avatarUrl)
      toast.success('Avatar updated')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Avatar upload failed — try again')
      // revert preview on failure
      setAvatarPreview(user?.avatarUrl || '')
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Only JPG, PNG or GIF allowed')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('File too large. Max 4MB.')
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    uploadAvatar.mutate(file)
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center 
                 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white dark:bg-[#131b2e] rounded-xl shadow-xl w-full max-w-md 
                   my-8 max-h-[90vh] overflow-y-auto border border-border-subtle dark:border-[#1e3a5f]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-bold text-text-heading">
            Edit Profile
          </h3>
          <button onClick={onClose} className="p-1 rounded-full 
            hover:bg-surface-container text-on-surface-variant">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => !uploadAvatar.isPending && fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-surface-container 
                         border border-border-subtle cursor-pointer 
                         overflow-hidden flex items-center justify-center
                         hover:opacity-80 transition-opacity group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" 
                     className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-on-surface-variant">
                  {fullname?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 
                              flex items-center justify-center
                              opacity-0 group-hover:opacity-100 
                              transition-opacity">
                {uploadAvatar.isPending ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-on-surface-variant">
              {uploadAvatar.isPending ? 'Uploading...' : 'JPG, PNG or GIF. Max size 4MB.'}
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1 
                              text-on-surface-variant">Full Name</label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1 
                              text-on-surface-variant">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:bg-[#152538]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 pt-4 border-t border-border-subtle dark:border-[#1e3a5f]">
          <button onClick={onClose} 
                  className="px-4 py-2 rounded-lg border border-border-subtle 
                             font-medium text-on-surface hover:bg-surface-container
                             transition-colors">
            Cancel
          </button>
          <button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending}
            className="px-4 py-2 rounded-lg bg-secondary text-white 
                       font-medium disabled:opacity-50 hover:opacity-90
                       transition-opacity flex items-center gap-2"
          >
            {updateProfile.isPending && <Loader2 size={16} className="animate-spin" />}
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
