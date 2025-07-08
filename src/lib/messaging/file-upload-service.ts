import { supabase } from './supabase'

export interface FileUploadResult {
  url: string
  filename: string
  size: number
  type: string
}

export class FileUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
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
   * Upload a file to message attachments bucket
   */
  static async uploadMessageFile(
    file: File,
    conversationId: string,
    userId: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file)

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const filename = `${timestamp}_${randomStr}.${fileExtension}`
      
      // Create file path: userId/conversationId/filename
      const filePath = `${userId}/${conversationId}/${filename}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  /**
   * Delete a file from storage
   */
  static async deleteMessageFile(filePath: string): Promise<void> {
    try {
      // Extract just the path part from the full URL if needed
      const path = filePath.includes('/') ? filePath.split('/').slice(-3).join('/') : filePath

      const { error } = await supabase.storage
        .from('message-attachments')
        .remove([path])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * Get file info and check user access
   */
  static async getFileInfo(filePath: string, userId: string): Promise<{
    exists: boolean
    canAccess: boolean
    size?: number
    type?: string
  }> {
    try {
      // Check if file exists
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .list(filePath.split('/').slice(0, -1).join('/'))

      if (error) {
        return { exists: false, canAccess: false }
      }

      const filename = filePath.split('/').pop()
      const fileExists = data?.some(file => file.name === filename)

      if (!fileExists) {
        return { exists: false, canAccess: false }
      }

      // Check user access by verifying conversation participation
      const conversationId = filePath.split('/')[1]
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .is('left_at', null)
        .single()

      const canAccess = !!participant

      return {
        exists: true,
        canAccess,
        size: data?.find(f => f.name === filename)?.metadata?.size,
        type: data?.find(f => f.name === filename)?.metadata?.mimetype
      }
    } catch (error) {
      console.error('Error getting file info:', error)
      return { exists: false, canAccess: false }
    }
  }

  /**
   * Generate download URL for file
   */
  static async generateDownloadUrl(filePath: string, userId: string): Promise<string> {
    try {
      // Check user access first
      const fileInfo = await this.getFileInfo(filePath, userId)
      
      if (!fileInfo.exists || !fileInfo.canAccess) {
        throw new Error('File not found or access denied')
      }

      // Generate signed URL for download (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(filePath, 3600)

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
   * Get image thumbnail URL
   */
  static getImageThumbnail(filePath: string, width: number = 200, height: number = 200): string {
    const { data } = supabase.storage
      .from('message-attachments')
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
   * Validate file before upload
   */
  private static validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`)
    }

    // Check if file type is allowed
    const isImageAllowed = this.ALLOWED_IMAGE_TYPES.includes(file.type)
    const isDocumentAllowed = this.ALLOWED_DOCUMENT_TYPES.includes(file.type)

    if (!isImageAllowed && !isDocumentAllowed) {
      throw new Error(`File type ${file.type} is not allowed`)
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
   * Check if file is an image
   */
  static isImageFile(fileType: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(fileType)
  }

  /**
   * Check if file is a document
   */
  static isDocumentFile(fileType: string): boolean {
    return this.ALLOWED_DOCUMENT_TYPES.includes(fileType)
  }

  /**
   * Get file type category
   */
  static getFileCategory(fileType: string): 'image' | 'document' | 'unknown' {
    if (this.isImageFile(fileType)) return 'image'
    if (this.isDocumentFile(fileType)) return 'document'
    return 'unknown'
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
