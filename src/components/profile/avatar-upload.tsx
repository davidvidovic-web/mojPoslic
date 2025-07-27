'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { SupabaseFileUploadService } from '@/lib/supabase-file-upload'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"

interface AvatarUploadProps {
  currentAvatarUrl?: string
  onAvatarUploaded?: (avatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarUploaded,
  size = 'md',
  className = ''
}: AvatarUploadProps) {
  const { user, refreshUser } = useSupabaseAuth()
  const t = useTranslations('profile.avatar')
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file before upload
    try {
      // Check if it's an image
      if (!SupabaseFileUploadService.isImageFile(file.type)) {
        toast.error(t('errors.invalidFileType'))
        return
      }

      // Check file size (5MB limit for avatars)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error(t('errors.fileTooLarge'))
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      handleUpload(file)
    } catch (error) {
      console.error('File validation error:', error)
      toast.error(t('errors.uploadFailed'))
    }
  }

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      toast.error(t('errors.notAuthenticated'))
      return
    }

    setIsUploading(true)

    try {
      // Upload to Supabase Storage
      const result = await SupabaseFileUploadService.uploadAvatar(file, user.id)

      // Get session for auth header
      const { supabase } = await import("@/lib/supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Please sign in again to continue')
      }

      // Update user profile with new avatar URL
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          avatarUrl: result.url
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Refresh user data to get updated avatar
      await refreshUser()

      // Call callback if provided
      onAvatarUploaded?.(result.url)

      toast.success(t('uploadSuccess'))
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error(t('errors.uploadFailed'))
      // Reset preview on error
      setPreviewUrl(currentAvatarUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.id) return

    setIsUploading(true)

    try {
      // Get session for auth header
      const { supabase } = await import("@/lib/supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Please sign in again to continue')
      }

      // Update user profile to remove avatar
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          avatarUrl: null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Clear preview
      setPreviewUrl(null)

      // Refresh user data
      await refreshUser()

      // Call callback if provided
      onAvatarUploaded?.('')

      toast.success(t('removeSuccess'))
    } catch (error) {
      console.error('Avatar removal error:', error)
      toast.error(t('errors.removeFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getUserInitials = () => {
    if (!user?.name) return '?'
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Avatar with upload overlay */}
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} cursor-pointer transition-opacity group-hover:opacity-80`}>
          <AvatarImage 
            src={previewUrl || currentAvatarUrl} 
            alt={user?.name || 'Profile'} 
          />
          <AvatarFallback className="text-lg font-semibold">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        <div 
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={openFileDialog}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('uploading')}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {t('upload')}
            </>
          )}
        </Button>

        {(previewUrl || currentAvatarUrl) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-2" />
            {t('remove')}
          </Button>
        )}
      </div>

      {/* Upload instructions */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        {t('instructions')}
      </p>
    </div>
  )
}
