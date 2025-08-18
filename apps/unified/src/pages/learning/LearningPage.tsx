import { useState } from 'react'
import { 
  AcademicCapIcon,
  BookOpenIcon,
  PlayIcon,
  ClockIcon,
  StarIcon,
  CheckBadgeIcon,
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Course {
  id: number
  title: string
  description: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  progress?: number
  rating: number
  enrolledStudents: number
  instructor: string
  thumbnail: string
}

interface Certification {
  id: number
  name: string
  issuer: string
  status: 'earned' | 'in-progress' | 'available'
  progress?: number
  validUntil?: string
  badgeColor: string
}

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'certifications' | 'progress'>('courses')

  const courses: Course[] = [
    {
      id: 1,
      title: 'IT Service Management Fundamentals',
      description: 'Learn the basics of ITSM including ITIL framework, service lifecycle, and best practices.',
      duration: '4.5 hours',
      level: 'Beginner',
      category: 'ITSM',
      progress: 75,
      rating: 4.8,
      enrolledStudents: 1234,
      instructor: 'Dr. Sarah Johnson',
      thumbnail: 'itsm-fundamentals'
    },
    {
      id: 2,
      title: 'Advanced Incident Management',
      description: 'Master incident management processes, escalation procedures, and resolution strategies.',
      duration: '6 hours',
      level: 'Advanced',
      category: 'ITSM',
      rating: 4.9,
      enrolledStudents: 567,
      instructor: 'Mike Chen',
      thumbnail: 'incident-management'
    },
    {
      id: 3,
      title: 'Cybersecurity Awareness Training',
      description: 'Essential cybersecurity knowledge for all employees including threat recognition and prevention.',
      duration: '2 hours',
      level: 'Beginner',
      category: 'Security',
      progress: 100,
      rating: 4.7,
      enrolledStudents: 2345,
      instructor: 'Alex Rivera',
      thumbnail: 'cybersecurity'
    },
    {
      id: 4,
      title: 'Asset Management Best Practices',
      description: 'Comprehensive guide to IT asset lifecycle management and optimization strategies.',
      duration: '3.5 hours',
      level: 'Intermediate',
      category: 'Asset Management',
      rating: 4.6,
      enrolledStudents: 890,
      instructor: 'Jennifer Wilson',
      thumbnail: 'asset-management'
    }
  ]

  const certifications: Certification[] = [
    {
      id: 1,
      name: 'ITIL Foundation',
      issuer: 'AXELOS',
      status: 'earned',
      validUntil: 'Permanent',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Service Desk Analyst',
      issuer: 'HDI',
      status: 'in-progress',
      progress: 60,
      badgeColor: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Incident Management Professional',
      issuer: 'PINK Elephant',
      status: 'available',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Cybersecurity Fundamentals',
      issuer: 'CompTIA',
      status: 'earned',
      validUntil: '2026-12-31',
      badgeColor: 'bg-red-500'
    }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'earned':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'available':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="h-5 w-5 text-white" />
            </div>
            Learning & Development
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enhance your skills with professional training and certifications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Courses Enrolled
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  12
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckBadgeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Completed
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  8
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrophyIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Certifications
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  3
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Learning Hours
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  47.5
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'courses', name: 'Courses', icon: BookOpenIcon },
              { id: 'certifications', name: 'Certifications', icon: TrophyIcon },
              { id: 'progress', name: 'My Progress', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-nova-500 text-nova-600 dark:text-nova-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Available Courses
                </h2>
                <div className="flex items-center gap-2">
                  <select 
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm dark:bg-gray-700 dark:text-white"
                    aria-label="Filter courses by category"
                  >
                    <option>All Categories</option>
                    <option>ITSM</option>
                    <option>Security</option>
                    <option>Asset Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-nova-500 to-purple-600 flex items-center justify-center">
                      <BookOpenIcon className="h-16 w-16 text-white opacity-50" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{course.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="h-4 w-4" />
                          {course.enrolledStudents}
                        </div>
                      </div>
                      {course.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-gray-900 dark:text-white">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-nova-600 h-2 rounded-full transition-all duration-300 w-3/4"></div>
                          </div>
                        </div>
                      )}
                      <button className="w-full flex items-center justify-center gap-2 bg-nova-600 text-white py-2 px-4 rounded-lg hover:bg-nova-700 transition-colors">
                        <PlayIcon className="h-4 w-4" />
                        {course.progress !== undefined ? 'Continue Learning' : 'Start Course'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Professional Certifications
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {certifications.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${cert.badgeColor} flex items-center justify-center`}>
                          <TrophyIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {cert.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cert.issuer}
                          </p>
                          {cert.validUntil && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Valid until: {cert.validUntil}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                        {cert.status === 'earned' ? 'Earned' : cert.status === 'in-progress' ? 'In Progress' : 'Available'}
                      </span>
                    </div>
                    {cert.progress !== undefined && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-gray-900 dark:text-white">{cert.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300 w-3/5"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Learning Progress
              </h2>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Current Courses
                  </h3>
                  <div className="space-y-4">
                    {courses.filter(course => course.progress !== undefined && course.progress < 100).map((course) => (
                      <div key={course.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {course.title}
                          </h4>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-nova-600 h-2 rounded-full transition-all duration-300 w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Achievements
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckBadgeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          First Course Completed
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Completed your first training course
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <TrophyIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          Certification Earned
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Earned your first professional certification
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
