import { PrismaClient } from '@prisma/client'
import { ConversationService } from './conversation-service'

const prisma = new PrismaClient()

interface PrivacySettings {
  profileVisibility: 'public' | 'verified_only' | 'private'
  showSkills: boolean
  showExperience: boolean
  showContactInfo: boolean
  showLocation: boolean
  applicationPrivacy: 'open' | 'selective' | 'private'
  allowDirectMessages: boolean
  showOnlineStatus: boolean
  dataSharing: boolean
  analyticsOptOut: boolean
}

interface FilteredProfile {
  id: string
  name: string
  email?: string
  avatarUrl?: string | null
  bio?: string | null
  role: string | null
  profileSetupCompleted?: boolean
  skills?: string | null
  experience?: string | null
  location?: string | null
  phone?: string | null
  website?: string | null
}

export class PrivacyService {
  /**
   * Get user's privacy settings
   */
  static async getUserPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const settings = await prisma.userPrivacySettings.findUnique({
        where: { userId }
      })

      // Return default settings if none exist
      if (!settings) {
        return {
          profileVisibility: 'public',
          showSkills: true,
          showExperience: true,
          showContactInfo: false,
          showLocation: true,
          applicationPrivacy: 'open',
          allowDirectMessages: true,
          showOnlineStatus: true,
          dataSharing: false,
          analyticsOptOut: false,
        }
      }

      return {
        profileVisibility: settings.profileVisibility as 'public' | 'verified_only' | 'private',
        showSkills: settings.showSkills,
        showExperience: settings.showExperience,
        showContactInfo: settings.showContactInfo,
        showLocation: settings.showLocation,
        applicationPrivacy: settings.applicationPrivacy as 'open' | 'selective' | 'private',
        allowDirectMessages: settings.allowDirectMessages,
        showOnlineStatus: settings.showOnlineStatus,
        dataSharing: settings.dataSharing,
        analyticsOptOut: settings.analyticsOptOut,
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
      // Return default settings on error
      return {
        profileVisibility: 'public',
        showSkills: true,
        showExperience: true,
        showContactInfo: false,
        showLocation: true,
        applicationPrivacy: 'open',
        allowDirectMessages: true,
        showOnlineStatus: true,
        dataSharing: false,
        analyticsOptOut: false,
      }
    }
  }

  /**
   * Check if user allows direct messages
   */
  static async canReceiveDirectMessages(userId: string): Promise<boolean> {
    const settings = await this.getUserPrivacySettings(userId)
    return settings.allowDirectMessages
  }

  /**
   * Check if user's profile is visible to another user
   */
  static async isProfileVisible(
    profileOwnerUserId: string, 
    viewerUserId: string
  ): Promise<boolean> {
    try {
      // Profile owner can always see their own profile
      if (profileOwnerUserId === viewerUserId) {
        return true
      }

      const settings = await this.getUserPrivacySettings(profileOwnerUserId)

      switch (settings.profileVisibility) {
        case 'public':
          return true
        case 'verified_only':
          // Check if viewer is verified (has completed profile)
          const viewer = await prisma.user.findUnique({
            where: { id: viewerUserId },
            select: { profileSetupCompleted: true, emailVerified: true }
          })
          return !!(viewer?.profileSetupCompleted && viewer?.emailVerified)
        case 'private':
          // Check if they have an existing conversation or job relationship
          return await this.hasExistingRelationship(profileOwnerUserId, viewerUserId)
        default:
          return false
      }
    } catch (error) {
      console.error('Error checking profile visibility:', error)
      return false
    }
  }

  /**
   * Filter user profile data based on privacy settings
   */
  static async getFilteredProfile(
    userId: string, 
    viewerUserId: string
  ): Promise<FilteredProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          bio: true,
          skills: true,
          experience: true,
          location: true,
          phone: true,
          website: true,
          role: true,
          profileSetupCompleted: true,
        }
      })

      if (!user) {
        return null
      }

      // If viewer can't see the profile, return minimal info
      const canViewProfile = await this.isProfileVisible(userId, viewerUserId)
      if (!canViewProfile) {
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }
      }

      const settings = await this.getUserPrivacySettings(userId)

      // Filter based on privacy settings
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        profileSetupCompleted: user.profileSetupCompleted,
        skills: settings.showSkills ? user.skills : null,
        experience: settings.showExperience ? user.experience : null,
        location: settings.showLocation ? user.location : null,
        phone: settings.showContactInfo ? user.phone : null,
        website: user.website,
      }
    } catch (error) {
      console.error('Error filtering profile:', error)
      return null
    }
  }

  /**
   * Check if two users have an existing relationship (conversation, job application, etc.)
   */
  private static async hasExistingRelationship(
    userId1: string, 
    userId2: string
  ): Promise<boolean> {
    try {
      // Check for existing conversation
      const conversation = await ConversationService.findDirectConversation(userId1, userId2)
      if (conversation) {
        return true
      }

      // Check for job-related relationship (client-tasker through applications)
      const jobRelationship = await prisma.application.findFirst({
        where: {
          OR: [
            {
              userId: userId1,
              job: { postedById: userId2 }
            },
            {
              userId: userId2,
              job: { postedById: userId1 }
            }
          ]
        }
      })

      return !!jobRelationship
    } catch (error) {
      console.error('Error checking existing relationship:', error)
      return false
    }
  }

  /**
   * Create a conversation with privacy checks
   */
  static async createConversationWithPrivacyCheck(
    currentUserId: string,
    otherUserId: string,
    conversationType: 'direct' | 'job_related' = 'direct',
    jobId?: string,
    jobTitle?: string
  ) {
    try {
      // Check if other user allows direct messages
      const canReceiveMessages = await this.canReceiveDirectMessages(otherUserId)
      if (!canReceiveMessages && conversationType === 'direct') {
        throw new Error('User does not allow direct messages')
      }

      // For job-related conversations, privacy checks are less strict
      if (conversationType === 'job_related' && jobId && jobTitle) {
        return await ConversationService.createJobConversation(
          jobId,
          currentUserId,
          otherUserId,
          jobTitle
        )
      }

      // For direct conversations, check profile visibility
      const canViewProfile = await this.isProfileVisible(otherUserId, currentUserId)
      if (!canViewProfile) {
        throw new Error('Profile is not visible')
      }

      // Create direct conversation
      return await ConversationService.createDirectConversation(currentUserId, otherUserId)
    } catch (error) {
      console.error('Error creating conversation with privacy check:', error)
      throw error
    }
  }

  /**
   * Check if applications should be visible based on privacy settings
   */
  static async shouldShowApplications(
    applicantUserId: string,
    viewerUserId: string
  ): Promise<boolean> {
    try {
      const settings = await this.getUserPrivacySettings(applicantUserId)
      
      switch (settings.applicationPrivacy) {
        case 'open':
          return true
        case 'selective':
          // Check if viewer has job relationship with applicant
          return await this.hasExistingRelationship(applicantUserId, viewerUserId)
        case 'private':
          return applicantUserId === viewerUserId // Only to themselves
        default:
          return false
      }
    } catch (error) {
      console.error('Error checking application visibility:', error)
      return false
    }
  }

  /**
   * Get online status with privacy consideration
   */
  static async getOnlineStatus(userId: string, viewerUserId: string): Promise<boolean | null> {
    try {
      const settings = await this.getUserPrivacySettings(userId)
      
      if (!settings.showOnlineStatus) {
        return null // Status hidden
      }

      // Check if viewer can see the profile
      const canViewProfile = await this.isProfileVisible(userId, viewerUserId)
      if (!canViewProfile) {
        return null
      }

      // TODO: Implement actual online status tracking
      // For now, return null to indicate status is available but not implemented
      return null
    } catch (error) {
      console.error('Error getting online status:', error)
      return null
    }
  }
}
