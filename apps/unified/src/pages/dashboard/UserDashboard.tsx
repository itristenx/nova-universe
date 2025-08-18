import { useState, useEffect } from 'react'
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

interface UserStats {
  openTickets: number
  resolvedTickets: number
  avgResolutionTime: string
  upcomingMeetings: number
  recentRequests: number
  knowledgeBaseViews: number
}

interface RecentTicket {
  id: string
  title: string
  status: string
  createdAt: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        openTickets: 3,
        resolvedTickets: 12,
        avgResolutionTime: '1.2 days',
        upcomingMeetings: 2,
        recentRequests: 5,
        knowledgeBaseViews: 8
      })
      setRecentTickets([
        {
          id: 'TKT-1001',
          title: 'Request for software license',
          status: 'In Progress',
          createdAt: '2 days ago',
          priority: 'medium'
        },
        {
          id: 'TKT-1002',
          title: 'Laptop keyboard replacement',
          status: 'Waiting for Parts',
          createdAt: '1 week ago',
          priority: 'high'
        },
        {
          id: 'TKT-1003',
          title: 'VPN access setup',
          status: 'Resolved',
          createdAt: '2 weeks ago',
          priority: 'low'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'in progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'waiting for parts': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'open': return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Dashboard
        </h1>
        <button className="inline-flex items-center px-4 py-2 bg-nova-600 text-white text-sm font-medium rounded-lg hover:bg-nova-700 focus:outline-none focus:ring-2 focus:ring-nova-500 focus:ring-offset-2 transition-colors">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TicketIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Open Requests
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.openTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Resolved
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.resolvedTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg Resolution
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.avgResolutionTime}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Upcoming Meetings
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.upcomingMeetings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Requests
            </h3>
            <button className="text-sm text-nova-600 hover:text-nova-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`border-l-4 ${getPriorityColor(ticket.priority)} bg-gray-50 dark:bg-gray-700/50 p-3 rounded-r-lg`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.id}
                  </p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {ticket.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {ticket.createdAt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Help & Resources
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Knowledge Base
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Find answers to common questions
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ChatBubbleLeftIcon className="h-6 w-6 text-green-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Live Chat Support
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get instant help from our team
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <QuestionMarkCircleIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Video Tutorials
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Step-by-step guides and tutorials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Request
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <TicketIcon className="h-5 w-5 mr-2" />
            My Requests
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
            <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
            Contact Support
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <BookOpenIcon className="h-5 w-5 mr-2" />
            Help Center
          </button>
        </div>
      </div>
    </div>
  )
}
