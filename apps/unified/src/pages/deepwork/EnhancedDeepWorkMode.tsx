import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  EyeIcon,
  LightBulbIcon,
  DocumentTextIcon,
  PlusIcon,
  ChartBarIcon,
  BellSlashIcon,
  BookmarkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, formatRelativeTime } from '@utils/index'
import { ticketService } from '@services/tickets'
import { userService } from '@services/users'
import toast from 'react-hot-toast'
import './deepwork.css'

interface DeepWorkSession {
  id: string
  startTime: Date
  endTime?: Date
  ticketsWorked: string[]
  notesCount: number
  distractionsBlocked: number
  productivityScore: number
  focusBreaks: number
  goalAchieved: boolean
  sessionMinutes: number
}

interface QuickNote {
  id: string
  content: string
  timestamp: Date
  ticketId?: string
  tags: string[]
}

interface AISuggestion {
  id: string
  type: 'resolution' | 'related_ticket' | 'knowledge_base' | 'escalation' | 'automation'
  title: string
  description: string
  confidence: number
  actionable: boolean
  resourceUrl?: string
}

interface Props {
  onSessionEnd?: (session: DeepWorkSession) => void
}

export default function EnhancedDeepWorkMode({ onSessionEnd }: Props) {
  const { ticketId } = useParams()
  const navigate = useNavigate()

  // Session state
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Focus settings
  const [distractionsBlocked, setDistractionsBlocked] = useState(true)
  const [autoSuggestions, setAutoSuggestions] = useState(true)
  const [sessionGoalMinutes, setSessionGoalMinutes] = useState(60)

  // Notes and suggestions
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])

  // Session tracking
  const [ticketsWorked, setTicketsWorked] = useState<string[]>([])
  const [focusBreaks, setFocusBreaks] = useState(0)
  const [showSessionSummary, setShowSessionSummary] = useState(false)

  // Load ticket if provided
  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getTicket(ticketId!),
    enabled: !!ticketId
  })

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1)
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isActive, isPaused])

  // Load user preferences for deep work settings
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: userService.getCurrentUser
  })

  // Smart AI suggestions based on real ticket data
  useEffect(() => {
    if (ticket && isActive) {
      const generateSmartSuggestions = async () => {
        try {
          // Load related tickets for context-aware suggestions
          const filters: any = {}
          if (ticket.category) filters.category = [ticket.category]
          if (ticket.priority) filters.priority = [ticket.priority]
          
          const relatedTickets = await ticketService.getTickets(1, 5, filters)

          const suggestions: AISuggestion[] = []

          // Add related ticket suggestions
          if (relatedTickets.data.length > 0) {
            const recentResolved = relatedTickets.data.find(t => t.status === 'resolved')
            if (recentResolved) {
              suggestions.push({
                id: 'related-1',
                type: 'related_ticket',
                title: 'Similar resolved ticket found',
                description: `Ticket #${recentResolved.number} with similar "${ticket.category}" category was recently resolved`,
                confidence: 0.85,
                actionable: true,
                resourceUrl: `/tickets/${recentResolved.id}`
              })
            }
          }

          // Add knowledge suggestions based on ticket content
          if (ticket.title.toLowerCase().includes('network') || ticket.description?.toLowerCase().includes('network')) {
            suggestions.push({
              id: 'kb-1',
              type: 'knowledge_base',
              title: 'Network troubleshooting guide',
              description: 'Standard network connectivity troubleshooting steps',
              confidence: 0.78,
              actionable: true,
              resourceUrl: '/knowledge/network-troubleshooting'
            })
          }

          // Add escalation suggestion for complex tickets
          if (sessionDuration > 2 * 3600 && ticket.priority === 'high') { // 2+ hours on high priority
            suggestions.push({
              id: 'escalation-1',
              type: 'escalation',
              title: 'Consider escalation',
              description: 'High priority ticket worked for 2+ hours may benefit from senior assistance',
              confidence: 0.70,
              actionable: true
            })
          }

          setAiSuggestions(suggestions)
        } catch (error) {
          console.error('Error generating AI suggestions:', error)
          // Fallback to basic suggestions
          setAiSuggestions([
            {
              id: 'basic-1',
              type: 'resolution',
              title: 'Focus session active',
              description: 'Take advantage of uninterrupted time to thoroughly investigate this issue',
              confidence: 0.90,
              actionable: true
            }
          ])
        }
      }

      generateSmartSuggestions()
    }
  }, [ticket, isActive, sessionDuration])

  // Load user's deep work preferences
  useEffect(() => {
    if (currentUser?.preferences) {
      // Set session goal based on user preferences or defaults
      setSessionGoalMinutes(60) // Default, could be from user preferences
    }
  }, [currentUser])

  const startSession = useCallback(() => {
    const now = new Date()
    setIsActive(true)
    setIsPaused(false)
    setStartTime(now)
    setSessionDuration(0)
    setFocusBreaks(0)
    setQuickNotes([])
    
    if (ticketId && !ticketsWorked.includes(ticketId)) {
      setTicketsWorked(prev => [...prev, ticketId])
    }
    
    toast.success('Deep work session started')
  }, [ticketId, ticketsWorked])

  const pauseSession = useCallback(() => {
    setIsPaused(!isPaused)
    if (!isPaused) {
      setFocusBreaks(prev => prev + 1)
    }
    toast.success(isPaused ? 'Session resumed' : 'Session paused')
  }, [isPaused])

  const endSession = useCallback(() => {
    if (!startTime) return

    const session: DeepWorkSession = {
      id: Date.now().toString(),
      startTime,
      endTime: new Date(),
      ticketsWorked,
      notesCount: quickNotes.length,
      distractionsBlocked: 0, // Could track actual distractions
      productivityScore: Math.round((sessionDuration / (sessionGoalMinutes * 60)) * 100),
      focusBreaks,
      goalAchieved: sessionDuration >= sessionGoalMinutes * 60,
      sessionMinutes: Math.round(sessionDuration / 60)
    }

    setIsActive(false)
    setIsPaused(false)
    setShowSessionSummary(true)
    onSessionEnd?.(session)
    
    toast.success('Deep work session completed')
  }, [startTime, ticketsWorked, quickNotes.length, sessionDuration, sessionGoalMinutes, focusBreaks, onSessionEnd])

  const addQuickNote = useCallback(() => {
    if (currentNote.trim()) {
      const note: QuickNote = {
        id: Date.now().toString(),
        content: currentNote.trim(),
        timestamp: new Date(),
        tags: []
      }
      
      if (ticket?.id) {
        note.ticketId = ticket.id
      }
      setQuickNotes(prev => [note, ...prev])
      setCurrentNote('')
      toast.success('Note added')
    }
  }, [currentNote, ticket?.id])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return Math.min(100, (sessionDuration / (sessionGoalMinutes * 60)) * 100)
  }

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'resolution':
        return <LightBulbIcon className="h-4 w-4" />
      case 'knowledge_base':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'escalation':
        return <ChartBarIcon className="h-4 w-4" />
      default:
        return <BookmarkIcon className="h-4 w-4" />
    }
  }

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (ticketLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with session controls */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Deep Work Mode</h1>
              {isActive && (
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                  isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                )}>
                  {isPaused ? 'Paused' : 'Active'}
                </span>
              )}
            </div>

            {ticket && (
              <div className="text-sm text-gray-600">
                Working on: <span className="font-medium">#{ticket.number} - {ticket.title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Session timer */}
            {isActive && (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="font-mono text-lg font-semibold">{formatDuration(sessionDuration)}</span>
                <div className="progress-container" role="progressbar" aria-label="Session progress">
                  <div 
                    className={cn(
                      "progress-bar",
                      getProgressPercentage() >= 100 ? 'progress-bar-success' : 'progress-bar-primary'
                    )}
                    style={{ width: `${Math.min(100, getProgressPercentage())}%` }}
                  />
                </div>
              </div>
            )}

            {/* Session controls */}
            <div className="flex gap-2">
              {!isActive ? (
                <button
                  onClick={startSession}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Session
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseSession}
                    className={cn(
                      "inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md",
                      isPaused ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                    )}
                    aria-label={isPaused ? "Resume session" : "Pause session"}
                  >
                    {isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={endSession}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    aria-label="End session"
                  >
                    <StopIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Ticket details and work area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session settings */}
            {!isActive && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Session Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal (minutes)
                    </label>
                    <input
                      type="number"
                      value={sessionGoalMinutes}
                      onChange={(e) => setSessionGoalMinutes(parseInt(e.target.value) || 60)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      min="5"
                      max="480"
                      aria-label="Session goal in minutes"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={distractionsBlocked}
                        onChange={(e) => setDistractionsBlocked(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Block distractions</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoSuggestions}
                        onChange={(e) => setAutoSuggestions(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">AI suggestions</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket information */}
            {ticket && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Ticket</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">#{ticket.number} - {ticket.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                      ticket.priority === 'urgent' || ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    )}>
                      {ticket.priority}
                    </span>
                    <span className="text-gray-500">
                      Created {formatRelativeTime(ticket.createdAt)}
                    </span>
                    {ticket.assignee && (
                      <span className="text-gray-500">
                        Assigned to {ticket.assignee.firstName} {ticket.assignee.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Notes</h3>
              
              {/* Add note */}
              <div className="flex gap-2 mb-4">
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Add a quick note..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
                <button
                  onClick={addQuickNote}
                  disabled={!currentNote.trim()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Add note"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Notes list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {quickNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-900">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(note.timestamp)}
                    </p>
                  </div>
                ))}
                {quickNotes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No notes yet. Add your first note above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right column - AI suggestions and stats */}
          <div className="space-y-6">
            {/* Session stats */}
            {isActive && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Session Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">{formatDuration(sessionDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Goal Progress</span>
                    <span className="text-sm font-medium">{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Notes</span>
                    <span className="text-sm font-medium">{quickNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Focus Breaks</span>
                    <span className="text-sm font-medium">{focusBreaks}</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI suggestions */}
            {autoSuggestions && aiSuggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">AI Suggestions</h3>
                  <BellSlashIcon className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className={cn('p-1 rounded', getSuggestionColor(suggestion.confidence))}>
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                            {suggestion.actionable && (
                              <button className="text-xs text-blue-600 hover:text-blue-800">
                                View
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Deep Work Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Eliminate all distractions before starting</li>
                <li>• Take brief notes to maintain focus</li>
                <li>• Use AI suggestions to speed resolution</li>
                <li>• Take breaks only when necessary</li>
                <li>• Aim for complete ticket resolution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Session summary modal */}
      {showSessionSummary && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Session Complete!</h3>
                <button
                  onClick={() => setShowSessionSummary(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close session summary"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Duration</span>
                  <span className="font-medium">{formatDuration(sessionDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes Created</span>
                  <span className="font-medium">{quickNotes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal Achievement</span>
                  <span className={cn(
                    'font-medium',
                    getProgressPercentage() >= 100 ? 'text-green-600' : 'text-yellow-600'
                  )}>
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowSessionSummary(false)
                    if (ticket) {
                      navigate(`/tickets/${ticket.id}`)
                    } else {
                      navigate('/tickets')
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Continue Working
                </button>
                <button
                  onClick={() => setShowSessionSummary(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
