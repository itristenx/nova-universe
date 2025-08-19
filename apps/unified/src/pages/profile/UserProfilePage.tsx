import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  CameraIcon,
  CheckIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@stores/auth'
import { authService } from '@services/auth'
import { getInitials } from '@utils/index'
import { EnhancedFileUpload } from '@components/files/EnhancedFileUpload'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  firstName?: string
  lastName?: string
  email: string
  avatar?: string
  phone?: string
  title?: string
  department?: string
  bio?: string
  timezone?: string
  language?: string
  displayName?: string
}

export default function UserProfilePage() {
  const { t } = useTranslation(['profile', 'forms', 'common'])
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  // Helper function to get display name for profile
  const getProfileDisplayName = (profile: UserProfile): string => {
    if (profile.displayName) return profile.displayName
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    }
    if (profile.firstName) return profile.firstName
    if (profile.lastName) return profile.lastName
    return profile.email
  }

  // Helper function to get initials for profile
  const getProfileInitials = (profile: UserProfile): string => {
    const displayName = getProfileDisplayName(profile)
    return getInitials(displayName)
  }

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        ...(user.avatar && { avatar: user.avatar }),
        displayName: user.displayName,
        timezone: user.preferences?.timezone || 'UTC',
        language: user.preferences?.language || 'en'
      })
    }
    setIsLoading(false)
  }, [user])

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      // If a new avatar was uploaded, use it
      const updatedProfile = { ...profile }
      if (uploadedFiles.length > 0) {
        updatedProfile.avatar = uploadedFiles[0].url
      }

      // Call API to update user profile
      await authService.updateProfile(updatedProfile)
      
      toast.success('Profile updated successfully!')
      setEditMode(false)
      setUploadedFiles([])
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setProfile({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        ...(user.avatar && { avatar: user.avatar }),
        displayName: user.displayName,
        timezone: user.preferences?.timezone || 'UTC',
        language: user.preferences?.language || 'en'
      })
    }
    setEditMode(false)
    setUploadedFiles([])
  }

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(files)
    if (files.length > 0 && profile) {
      setProfile({ ...profile, avatar: files[0].url })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No profile found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Unable to load user profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Personal Information
            </h2>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-500 disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-nova-600 hover:bg-nova-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-500 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <LoadingSpinner size="sm" className="mr-1" />
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-1" />
                    )}
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-500"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={getProfileDisplayName(profile)}
                      className="h-32 w-32 rounded-full object-cover ring-4 ring-white dark:ring-gray-800"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-nova-600 text-2xl font-medium text-white ring-4 ring-white dark:ring-gray-800">
                      {getProfileInitials(profile)}
                    </div>
                  )}
                  
                  {editMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <CameraIcon className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {getProfileDisplayName(profile)}
                </h3>
                
                {profile.title && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile.title}
                  </p>
                )}
                
                {profile.department && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile.department}
                  </p>
                )}

                {editMode && (
                  <div className="mt-4 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Picture
                    </label>
                    <EnhancedFileUpload
                      context="profileImages"
                      maxFiles={1}
                      acceptedFileTypes={{
                        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                      }}
                      maxFileSize={5 * 1024 * 1024} // 5MB
                      onFilesUploaded={handleFileUpload}
                      className="h-24"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Upload a new profile picture (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      id="firstName"
                      aria-label={t('profile.firstName', 'First Name')}
                      value={profile.firstName || ''}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-nova-500 focus:border-nova-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {profile.firstName || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      id="lastName"
                      aria-label={t('profile.lastName', 'Last Name')}
                      value={profile.lastName || ''}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-nova-500 focus:border-nova-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {profile.lastName || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profile.email}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email address cannot be changed here. Contact your administrator.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      id="phone"
                      aria-label={t('profile.phoneNumber', 'Phone Number')}
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-nova-500 focus:border-nova-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {profile.phone || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Title
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      id="title"
                      aria-label={t('profile.jobTitle', 'Job Title')}
                      value={profile.title || ''}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-nova-500 focus:border-nova-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {profile.title || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      id="department"
                      aria-label={t('profile.department', 'Department')}
                      value={profile.department || ''}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-nova-500 focus:border-nova-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {profile.department || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timezone
                  </label>
                  {editMode ? (
                    <select
                      id="timezone"
                      aria-label={t('profile.timezone', 'Timezone')}
                      value={profile.timezone || 'UTC'}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-nova-500 focus:border-nova-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {profile.timezone || 'UTC'}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  {editMode ? (
                    <textarea
                      rows={3}
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder={t('profile.bioPlaceholder', 'Tell us a bit about yourself...')}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-nova-500 focus:border-nova-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {profile.bio || 'No bio provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
