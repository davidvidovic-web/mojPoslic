import { supabase } from './supabase'

export interface FileUploadResult {
  url: string
  filePath: string
  filename: string
  size: number
  type: string
}

export type BucketName = 'avatars' | 'resumes' | 'message-attachments' | 'company-logos'

export class SupabaseFileUploadService {
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
  private static readonly MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB for avatars

  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]

  private static readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ]

  /**
   * Create storage buckets if they don't exist
   */
  static async createBucketsIfNeeded(): Promise<void> {
    try {

      const requiredBuckets = ['avatars', 'resumes', 'message-attachments', 'company-logos']

      for (const bucketName of requiredBuckets) {
        try {
          // Try to create the bucket (this will fail if it already exists, which is fine)
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: true, // Make buckets public for file access
            allowedMimeTypes: bucketName === 'avatars' || bucketName === 'company-logos'
              ? this.ALLOWED_IMAGE_TYPES
              : bucketName === 'resumes'
              ? this.ALLOWED_DOCUMENT_TYPES
              : undefined,
            fileSizeLimit: bucketName === 'avatars' ? this.MAX_AVATAR_SIZE : this.MAX_FILE_SIZE
          })

          if (error && !error.message?.includes('already exists')) {
            console.error(`Error creating bucket ${bucketName}:`, error)
          } else {
          }
        } catch {
        }
      }

    } catch (error) {
      console.error('Error setting up buckets:', error)
    }
  }

  /**
   * Test Supabase storage connection and bucket availability
   */
  static async testStorageConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.listBuckets()

      if (error) {
        console.error('Storage connection test failed:', error)
        return false
      }


      // Check if required buckets exist
      const requiredBuckets = ['avatars', 'resumes', 'message-attachments', 'company-logos']
      const existingBuckets = data?.map(b => b.name) || []

      for (const bucketName of requiredBuckets) {
        if (!existingBuckets.includes(bucketName)) {
          console.warn(`Required bucket '${bucketName}' does not exist`)
          // Try to create the missing bucket
          try {
            await this.createBucketsIfNeeded()
          } catch (createError) {
            console.error(`Failed to create bucket ${bucketName}:`, createError)
          }
        } else {
        }
      }

      return true
    } catch (error) {
      console.error('Storage connection test error:', error)
      return false
    }
  }

  /**
   * Upload avatar image for user
   */
  static async uploadAvatar(
    file: File,
    userId: string
  ): Promise<FileUploadResult> {
    try {
      // Validate inputs
      if (!file) {
        throw new Error('No file provided')
      }
      if (!userId) {
        throw new Error('No user ID provided')
      }

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Authentication error:', authError)
        throw new Error('Authentication failed')
      }
      if (!user) {
        throw new Error('User not authenticated')
      }


      // Validate file for avatar
      this.validateAvatarFile(file)

      // Generate filename
      const fileExtension = file.name.split('.').pop()
      const filename = `${userId}.${fileExtension}`

      // Create file path: avatars/userId.ext
      const filePath = `${filename}`


      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing avatar
        })

      // If bucket doesn't exist, try to create it
      if (error && error.message?.includes('Bucket not found')) {
        // Continue with error handling below
      }

      if (error) {
        console.error('Avatar upload error:', error)
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          fullError: JSON.stringify(error, null, 2)
        })

        // Handle specific error types
        if (error.message?.includes('row-level security policy')) {
          console.error('RLS Policy Error - this suggests storage bucket policies are not set up correctly')
          throw new Error('Storage access denied. Please contact support to set up storage policies.')
        } else if (error.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket not found. Please ensure storage buckets are set up.')
        } else {
          throw new Error(`Upload failed: ${error.message || 'Unknown error'}`)
        }
      }

      if (!data) {
        throw new Error('Upload succeeded but no data returned')
      }


      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL')
      }


      return {
        url: urlData.publicUrl,
        filePath: data.path,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  /**
   * Upload resume document for user
   */
  static async uploadResume(
    file: File,
    userId: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file for resume
      this.validateResumeFile(file)

      // Generate filename with timestamp to allow multiple resumes
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const filename = `${userId}_${timestamp}.${fileExtension}`
      
      // Create file path: resumes/userId_timestamp.ext
      const filePath = `${filename}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Resume upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        filePath: data.path,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      throw error
    }
  }

  /**
   * Upload company logo
   */
  static async uploadCompanyLogo(
    file: File,
    companyId: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file for logo
      this.validateAvatarFile(file) // Same validation as avatar

      // Generate filename
      const fileExtension = file.name.split('.').pop()
      const filename = `${companyId}.${fileExtension}`
      
      // Create file path: company-logos/companyId.ext
      const filePath = `${filename}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing logo
        })

      if (error) {
        console.error('Company logo upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        filePath: data.path,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading company logo:', error)
      throw error
    }
  }

  /**
   * Delete a file from any bucket
   */
  static async deleteFile(bucket: BucketName, filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * Get image thumbnail URL (for avatars and logos)
   */
  static getImageThumbnail(
    bucket: BucketName, 
    filePath: string, 
    width: number = 200, 
    height: number = 200
  ): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath, {
        transform: {
          width,
          height,
          resize: 'cover'
        }
      })

    return data.publicUrl
  }

  /**
   * Generate download URL for file
   */
  static async generateDownloadUrl(
    bucket: BucketName,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      // Generate signed URL for download
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn)

      if (error) {
        throw new Error(`Failed to generate download URL: ${error.message}`)
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error generating download URL:', error)
      throw error
    }
  }

  /**
   * List user files in a bucket
   */
  static async listUserFiles(bucket: BucketName, userId: string): Promise<Array<{ name: string; id: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, unknown> }>> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', {
          search: userId
        })

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }

  /**
   * Validate avatar file
   */
  private static validateAvatarFile(file: File): void {
    // Check file size (smaller limit for avatars)
    if (file.size > this.MAX_AVATAR_SIZE) {
      throw new Error(`Avatar file size exceeds ${this.MAX_AVATAR_SIZE / 1024 / 1024}MB limit`)
    }

    // Check if file type is allowed (only images for avatars)
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Avatar file type ${file.type} is not allowed. Please use JPG, PNG, GIF, or WebP.`)
    }

    // Additional checks for empty files
    if (file.size === 0) {
      throw new Error('Cannot upload empty file')
    }

    // Check filename
    if (!file.name || file.name.trim() === '') {
      throw new Error('File must have a valid name')
    }
  }

  /**
   * Validate resume file
   */
  private static validateResumeFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`Resume file size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`)
    }

    // Check if file type is allowed (documents for resumes)
    if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw new Error(`Resume file type ${file.type} is not allowed. Please use PDF, DOC, DOCX, TXT, or CSV.`)
    }

    // Additional checks for empty files
    if (file.size === 0) {
      throw new Error('Cannot upload empty file')
    }

    // Check filename
    if (!file.name || file.name.trim() === '') {
      throw new Error('File must have a valid name')
    }
  }

  /**
   * Check if file type is an image
   */
  static isImageFile(fileType: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(fileType)
  }

  /**
   * Check if file type is a document
   */
  static isDocumentFile(fileType: string): boolean {
    return this.ALLOWED_DOCUMENT_TYPES.includes(fileType)
  }

  /**
   * Get file category
   */
  static getFileCategory(fileType: string): 'image' | 'document' | 'other' {
    if (this.isImageFile(fileType)) return 'image'
    if (this.isDocumentFile(fileType)) return 'document'
    return 'other'
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get file icon based on type
   */
  static getFileIcon(fileType: string): string {
    const category = this.getFileCategory(fileType)
    
    switch (category) {
      case 'image':
        return '🖼️'
      case 'document':
        if (fileType.includes('pdf')) return '📄'
        if (fileType.includes('word') || fileType.includes('document')) return '📝'
        if (fileType.includes('text')) return '📃'
        return '📄'
      default:
        return '📎'
    }
  }
}
