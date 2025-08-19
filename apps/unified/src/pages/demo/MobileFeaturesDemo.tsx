import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import PullToRefresh from '@components/mobile/PullToRefresh'
import CameraIntegration from '@components/mobile/CameraIntegration'
import TouchGestureDetector, { SwipeActions } from '@components/mobile/TouchGestures'
import MobileLayout, { MobileHeader, MobileList, MobileCard } from '@components/mobile/MobileLayout'
import EnhancedKnowledgeBase from '@components/knowledge/EnhancedKnowledgeBase'

// Sample data for demonstration
const sampleArticles = [
  {
    id: '1',
    title: 'How to Submit a Support Ticket',
    content: 'Complete guide on submitting support tickets through the Nova Universe platform...',
    excerpt: 'Learn the step-by-step process for creating effective support tickets that get resolved quickly.',
    category: 'Getting Started',
    tags: ['tickets', 'support', 'beginner'],
    author: 'Support Team',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    viewCount: 1250,
    rating: 4.8,
    difficulty: 'beginner' as const,
    estimatedReadTime: 5,
    isBookmarked: true
  },
  {
    id: '2',
    title: 'Asset Management Best Practices',
    content: 'Advanced techniques for managing IT assets in your organization...',
    excerpt: 'Discover professional strategies for tracking, maintaining, and optimizing your IT asset inventory.',
    category: 'Asset Management',
    tags: ['assets', 'inventory', 'best-practices', 'advanced'],
    author: 'IT Operations',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    viewCount: 890,
    rating: 4.6,
    difficulty: 'advanced' as const,
    estimatedReadTime: 12,
    isBookmarked: false
  },
  {
    id: '3',
    title: 'Mobile App Features Overview',
    content: 'Explore the mobile capabilities of Nova Universe including offline support...',
    excerpt: 'Get familiar with pull-to-refresh, camera integration, and touch gestures in the mobile interface.',
    category: 'Mobile Features',
    tags: ['mobile', 'features', 'tutorial', 'intermediate'],
    author: 'Product Team',
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
    viewCount: 456,
    rating: 4.9,
    difficulty: 'intermediate' as const,
    estimatedReadTime: 8,
    isBookmarked: true
  }
]

const sampleTickets = [
  {
    id: 'T-2024-001',
    title: 'Laptop keyboard not working',
    status: 'Open',
    priority: 'High',
    assignee: 'John Smith',
    createdAt: '2024-01-22T09:30:00Z'
  },
  {
    id: 'T-2024-002', 
    title: 'Request for new software license',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'Sarah Johnson',
    createdAt: '2024-01-21T14:15:00Z'
  },
  {
    id: 'T-2024-003',
    title: 'Network connectivity issues',
    status: 'Resolved',
    priority: 'Low',
    assignee: 'Mike Davis',
    createdAt: '2024-01-20T11:20:00Z'
  }
]

export default function MobileFeaturesDemo() {
  const { t } = useTranslation(['app', 'common'])
  const [activeTab, setActiveTab] = useState<'pull-refresh' | 'camera' | 'gestures' | 'knowledge'>('pull-refresh')
  const [refreshCount, setRefreshCount] = useState(0)
  const [capturedFiles, setCapturedFiles] = useState<File[]>([])
  const [gestureLog, setGestureLog] = useState<string[]>([])

  const handleRefresh = useCallback(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRefreshCount(prev => prev + 1)
  }, [])

  const handleFileCapture = useCallback((file: File) => {
    setCapturedFiles(prev => [...prev, file])
  }, [])

  const logGesture = useCallback((gesture: string) => {
    setGestureLog(prev => [
      `${new Date().toLocaleTimeString()}: ${gesture}`,
      ...prev.slice(0, 9)
    ])
  }, [])

  const handleArticleSelect = useCallback((article: any) => {
    console.log('Selected article:', article.title)
  }, [])

  const handleBookmarkToggle = useCallback((articleId: string) => {
    console.log('Toggled bookmark for article:', articleId)
  }, [])

  return (
    <MobileLayout
      quickAction={{
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
        label: 'Create Ticket',
        onClick: () => console.log('Quick action: Create ticket')
      }}
    >
      {/* Mobile Header */}
      <MobileHeader
        title="Mobile Features Demo"
        leftAction={{
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          ),
          onClick: () => window.history.back(),
          label: 'Go back'
        }}
        rightActions={[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            onClick: () => console.log('Settings clicked'),
            label: 'Settings'
          }
        ]}
      />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { key: 'pull-refresh', label: 'Pull to Refresh' },
            { key: 'camera', label: 'Camera' },
            { key: 'gestures', label: 'Gestures' },
            { key: 'knowledge', label: 'Knowledge Base' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'pull-refresh' && (
          <PullToRefresh onRefresh={handleRefresh}>
            <div className="p-4 space-y-4">
              <MobileCard>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Pull to Refresh Demo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Pull down at the top of the screen to refresh the content
                  </p>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Refreshed {refreshCount} times
                  </div>
                </div>
              </MobileCard>

              <MobileList>
                {sampleTickets.map((ticket, index) => (
                  <MobileCard key={ticket.id} padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {ticket.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.id} • {ticket.assignee}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'Open' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </MobileCard>
                ))}
              </MobileList>
            </div>
          </PullToRefresh>
        )}

        {activeTab === 'camera' && (
          <div className="p-4 space-y-4">
            <MobileCard>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Camera Integration Demo
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Take photos or select files for ticket attachments
                </p>
                <CameraIntegration
                  onCapture={handleFileCapture}
                  onError={(error) => console.error('Camera error:', error)}
                  className="flex justify-center"
                />
              </div>
            </MobileCard>

            {capturedFiles.length > 0 && (
              <MobileCard>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Captured Files ({capturedFiles.length})
                </h4>
                <div className="space-y-2">
                  {capturedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileCard>
            )}
          </div>
        )}

        {activeTab === 'gestures' && (
          <div className="p-4 space-y-4">
            <MobileCard>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Touch Gestures Demo
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Try swiping, tapping, and long-pressing on the items below
                </p>
              </div>
            </MobileCard>

            <TouchGestureDetector
              handlers={{
                onSwipeLeft: () => logGesture('Swipe Left'),
                onSwipeRight: () => logGesture('Swipe Right'),
                onSwipeUp: () => logGesture('Swipe Up'),
                onSwipeDown: () => logGesture('Swipe Down'),
                onTap: () => logGesture('Tap'),
                onLongPress: () => logGesture('Long Press'),
                onPinch: (gesture) => logGesture(`Pinch (scale: ${gesture.scale?.toFixed(2)})`),
              }}
              className="bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center"
            >
              <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Touch Gesture Area
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Try different gestures here
              </p>
            </TouchGestureDetector>

            {/* Swipe Actions Demo */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Swipe Actions Demo</h4>
              {sampleTickets.slice(0, 2).map(ticket => (
                <SwipeActions
                  key={ticket.id}
                  leftActions={[
                    {
                      label: 'Archive',
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
                        </svg>
                      ),
                      color: 'bg-green-600 hover:bg-green-700',
                      action: () => logGesture(`Archive ${ticket.id}`)
                    }
                  ]}
                  rightActions={[
                    {
                      label: 'Delete',
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      ),
                      color: 'bg-red-600 hover:bg-red-700',
                      action: () => logGesture(`Delete ${ticket.id}`)
                    }
                  ]}
                >
                  <MobileCard padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {ticket.title}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Swipe left or right for actions
                        </p>
                      </div>
                    </div>
                  </MobileCard>
                </SwipeActions>
              ))}
            </div>

            {/* Gesture Log */}
            {gestureLog.length > 0 && (
              <MobileCard>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Gesture Log
                </h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {gestureLog.map((log, index) => (
                    <div key={index} className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              </MobileCard>
            )}
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="p-4">
            <EnhancedKnowledgeBase
              articles={sampleArticles}
              categories={['Getting Started', 'Asset Management', 'Mobile Features', 'Troubleshooting']}
              onArticleSelect={handleArticleSelect}
              onBookmarkToggle={handleBookmarkToggle}
            />
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
