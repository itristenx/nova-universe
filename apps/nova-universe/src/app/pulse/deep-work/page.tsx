'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  EyeIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'

interface Ticket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
  customer: {
    name: string
    email: string
    avatar?: string
  }
  createdAt: string
  dueDate?: string
  slaStatus: 'ok' | 'warning' | 'breach'
  timeSpent: number
  estimatedTime?: number
}

interface WorkSession {
  id: string
  ticketId: string
  startTime: string
  endTime?: string
  duration: number
  notes?: string
  status: 'active' | 'paused' | 'completed'
}

interface TicketNote {
  id: string
  content: string
  timestamp: string
  type: 'note' | 'customer-communication' | 'internal'
  author: string
}

const mockTicket: Ticket = {
  id: 'TKT-001',
  title: 'Email server not responding',
  description: 'Users unable to send or receive emails since this morning. The mail server appears to be down and needs immediate attention. Multiple departments are affected including Sales, Marketing, and Customer Support.',
  priority: 'high',
  status: 'in-progress',
  customer: {
    name: 'John Smith',
    email: 'john.smith@company.com',
  },
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  slaStatus: 'warning',
  timeSpent: 45,
  estimatedTime: 120,
}

const mockNotes: TicketNote[] = [
  {
    id: '1',
    content: 'Initial investigation shows mail server is responding but Exchange services are down',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'note',
    author: 'Current User',
  },
  {
    id: '2',
    content: 'Contacted customer to inform about the issue and provided temporary workaround',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    type: 'customer-communication',
    author: 'Current User',
  },
]

export default function DeepWorkPage() {
  const searchParams = useSearchParams()
  const ticketId = searchParams?.get('ticket')
  
  const [ticket, setTicket] = useState<Ticket>(mockTicket)
  const [workSession, setWorkSession] = useState<WorkSession | null>(null)
  const [notes, setNotes] = useState<TicketNote[]>(mockNotes)
  const [newNote, setNewNote] = useState('')
  const [sessionTime, setSessionTime] = useState(0)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [breakReminder, setBreakReminder] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isSessionActive && workSession) {
      interval = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1
          
          // Break reminder every 25 minutes (Pomodoro technique)
          if (newTime % (25 * 60) === 0 && newTime > 0) {
            setBreakReminder(true)
          }
          
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSessionActive, workSession])

  const startWorkSession = () => {
    const newSession: WorkSession = {
      id: `session-${Date.now()}`,
      ticketId: ticket.id,
      startTime: new Date().toISOString(),
      duration: 0,
      status: 'active',
    }
    
    setWorkSession(newSession)
    setIsSessionActive(true)
    setSessionTime(0)
    setFocusMode(true)
  }

  const pauseWorkSession = () => {
    if (workSession) {
      setWorkSession(prev => prev ? { ...prev, status: 'paused' } : null)
      setIsSessionActive(false)
    }
  }

  const resumeWorkSession = () => {
    if (workSession) {
      setWorkSession(prev => prev ? { ...prev, status: 'active' } : null)
      setIsSessionActive(true)
    }
  }

  const completeWorkSession = () => {
    if (workSession) {
      const completedSession: WorkSession = {
        ...workSession,
        endTime: new Date().toISOString(),
        duration: sessionTime,
        status: 'completed',
      }
      
      // Update ticket time spent
      setTicket(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + Math.floor(sessionTime / 60),
      }))
      
      setWorkSession(null)
      setIsSessionActive(false)
      setSessionTime(0)
      setFocusMode(false)
    }
  }

  const addNote = () => {
    if (newNote.trim()) {
      const note: TicketNote = {
        id: `note-${Date.now()}`,
        content: newNote.trim(),
        timestamp: new Date().toISOString(),
        type: 'note',
        author: 'Current User',
      }
      
      setNotes(prev => [note, ...prev])
      setNewNote('')
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100 border-blue-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      high: 'text-orange-600 bg-orange-100 border-orange-200',
      critical: 'text-red-600 bg-red-100 border-red-200',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getSlaStatusColor = (slaStatus: string) => {
    if (slaStatus === 'breach') return 'text-red-500'
    if (slaStatus === 'warning') return 'text-orange-500'
    return 'text-green-500'
  }

  if (focusMode && isSessionActive) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          {/* Focus Mode Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <EyeIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Deep Work Mode</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
            <p className="text-muted-foreground">Stay focused on resolving this ticket</p>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-mono font-bold mb-4">
              {formatTime(sessionTime)}
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={pauseWorkSession}
                className="bg-background/80"
              >
                <PauseIcon className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button
                onClick={completeWorkSession}
                className="bg-background/80"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Complete Session
              </Button>
              <Button
                variant="ghost"
                onClick={() => setFocusMode(false)}
                className="bg-background/80"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Exit Focus
              </Button>
            </div>
          </div>

          {/* Quick Note */}
          <Card className="max-w-2xl mx-auto bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Quick Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add notes about your progress..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-24"
              />
              <Button onClick={addNote} className="w-full">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Break Reminder Modal */}
        {breakReminder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle>Time for a Break!</CardTitle>
                <CardDescription>
                  You've been working for 25 minutes. Consider taking a 5-minute break to stay fresh.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setBreakReminder(false)}
                    className="flex-1"
                  >
                    Continue Working
                  </Button>
                  <Button
                    onClick={() => {
                      pauseWorkSession()
                      setBreakReminder(false)
                    }}
                    className="flex-1"
                  >
                    Take Break
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deep Work Mode</h1>
          <p className="text-muted-foreground">
            Focus on resolving tickets without distractions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Knowledge Base
          </Button>
          <Button variant="outline">
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Team Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ticket Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-medium text-primary">
                      {ticket.id}
                    </span>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className={`w-4 h-4 ${getSlaStatusColor(ticket.slaStatus)}`} />
                      <span className={`text-xs ${getSlaStatusColor(ticket.slaStatus)}`}>
                        {ticket.slaStatus === 'breach' ? 'SLA Breach' :
                         ticket.slaStatus === 'warning' ? 'SLA Warning' : 'On Time'}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold">{ticket.title}</h2>
                  <p className="text-muted-foreground">{ticket.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Customer:</span>
                  <p className="text-muted-foreground">{ticket.customer.name}</p>
                  <p className="text-muted-foreground text-xs">{ticket.customer.email}</p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">{formatRelativeTime(ticket.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Time Spent:</span>
                  <p className="text-muted-foreground">{ticket.timeSpent} minutes</p>
                </div>
                <div>
                  <span className="font-medium">Estimated:</span>
                  <p className="text-muted-foreground">
                    {ticket.estimatedTime ? `${ticket.estimatedTime} minutes` : 'Not set'}
                  </p>
                </div>
              </div>

              {ticket.estimatedTime && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round((ticket.timeSpent / ticket.estimatedTime) * 100)}%</span>
                  </div>
                  <Progress value={(ticket.timeSpent / ticket.estimatedTime) * 100} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Session Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Work Session</CardTitle>
              <CardDescription>
                Track your time and maintain focus on this ticket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!workSession ? (
                <Button onClick={startWorkSession} className="w-full" size="lg">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Deep Work Session
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold">
                      {formatTime(sessionTime)}
                    </div>
                    <p className="text-sm text-muted-foreground">Current session time</p>
                  </div>

                  <div className="flex space-x-3">
                    {isSessionActive ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={pauseWorkSession}
                          className="flex-1"
                        >
                          <PauseIcon className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                        <Button
                          onClick={() => setFocusMode(true)}
                          className="flex-1"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Focus Mode
                        </Button>
                      </>
                    ) : (
                      <Button onClick={resumeWorkSession} className="flex-1">
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={completeWorkSession}
                      className="flex-1"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Note Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Document your progress, findings, or next steps..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-32"
              />
              <Button onClick={addNote} disabled={!newNote.trim()}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Notes History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity & Notes</CardTitle>
              <CardDescription>
                Track progress and communication history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No notes yet. Add your first note to track progress.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="border-l-2 border-muted pl-4 py-2"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {note.type === 'customer-communication' && (
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500" />
                        )}
                        {note.type === 'note' && (
                          <DocumentTextIcon className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(note.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {note.author}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                Escalate Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Contact Customer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                View Knowledge
              </Button>
              <Button className="w-full justify-start">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Resolve Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}