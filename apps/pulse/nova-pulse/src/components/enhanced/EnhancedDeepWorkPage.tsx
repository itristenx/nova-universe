import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTickets, updateTicket, getAssetsForUser, getTicketHistory, getRelatedItems } from '../../lib/api'
import './EnhancedDeepWorkPage.css'

// Enhanced types for the deep work page
interface EnhancedTicketHistoryEntry {
  id: string
  user: string
  timestamp: string
  action: string
  details?: string
  content?: string
  isMarkdown?: boolean
  mentions?: string[]
  attachments?: Attachment[]
  watchers?: string[]
}

// Simple icon components
const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 14.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const Settings = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Brain = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const Upload = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const Paperclip = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
)

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const UserPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const ProgressIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
  </svg>
)

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  preview?: string
}

interface Comment {
  id: string
  author: string
  timestamp: string
  content: string
  isMarkdown: boolean
  mentions: string[]
  attachments: Attachment[]
  watchers?: string[]
}

interface Subtask {
  id: string
  title: string
  status: 'open' | 'in_progress' | 'completed'
  assignedTo?: string
  dueDate?: string
}

interface OpenTicket {
  id: string
  ticketId: string
  title: string
  status: string
  hasUnsavedChanges: boolean
}

interface ContextualPanel {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
  position: 'left' | 'right'
  size: 'sm' | 'md' | 'lg'
  collapsible?: boolean
}

// Rich Text Editor Component
const RichTextEditor: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onMention?: (query: string) => void
  onAttachment?: (files: FileList) => void
  showToolbar?: boolean
}> = ({ value, onChange, placeholder, onMention, onAttachment, showToolbar = true }) => {
  const [isPreview, setIsPreview] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (onAttachment && e.dataTransfer.files.length > 0) {
      onAttachment(e.dataTransfer.files)
    }
  }, [onAttachment])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText = ''
    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        break
      case 'code':
        newText = selectedText.includes('\n') ? `\`\`\`\n${selectedText || 'code'}\n\`\`\`` : `\`${selectedText || 'code'}\``
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        break
    }

    const newValue = value.substring(0, start) + newText + value.substring(end)
    onChange(newValue)
  }

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-2 rounded mt-2"><code>$1</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {showToolbar && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
          <button
            type="button"
            onClick={() => insertFormatting('bold')}
            className="p-1 rounded hover:bg-gray-200"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('italic')}
            className="p-1 rounded hover:bg-gray-200"
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('code')}
            className="p-1 rounded hover:bg-gray-200 font-mono"
            title="Code"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('link')}
            className="p-1 rounded hover:bg-gray-200"
            title="Link"
          >
            🔗
          </button>
          <div className="border-l border-gray-300 mx-2 h-4" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded hover:bg-gray-200"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`px-2 py-1 rounded text-sm ${isPreview ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      )}
      
      <div 
        className={`relative ${dragOver ? 'bg-blue-50 border-blue-300' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isPreview ? (
          <div 
            className="p-3 min-h-[100px] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 min-h-[100px] resize-none focus:outline-none"
          />
        )}
        
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-300">
            <div className="text-center">
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-700 font-medium">Drop files to attach</p>
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onAttachment && e.target.files && onAttachment(e.target.files)}
      />
    </div>
  )
}

// Attachment Preview Component
const AttachmentPreview: React.FC<{ attachment: Attachment; onRemove?: () => void }> = ({ 
  attachment, 
  onRemove 
}) => {
  const isImage = attachment.type.startsWith('image/')
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      {isImage && attachment.preview ? (
        <img src={attachment.preview} alt={attachment.name} className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          <Paperclip className="w-6 h-6 text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{attachment.name}</p>
        <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-gray-200"
          title="Remove attachment"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  )
}

// Progress Bar Component
const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      data-progress={progress}
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
)
const WatcherManager: React.FC<{
  watchers: string[]
  onAdd: (email: string) => void
  onRemove: (email: string) => void
}> = ({ watchers, onAdd, onRemove }) => {
  const [newWatcher, setNewWatcher] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (newWatcher.trim() && !watchers.includes(newWatcher.trim())) {
      onAdd(newWatcher.trim())
      setNewWatcher('')
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Watchers</h5>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 rounded hover:bg-gray-200"
          title="Add watcher"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>
      
      {isAdding && (
        <div className="flex gap-2">
          <input
            type="email"
            value={newWatcher}
            onChange={(e) => setNewWatcher(e.target.value)}
            placeholder="Email address"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}
      
      <div className="space-y-1">
        {watchers.map(watcher => (
          <div key={watcher} className="flex items-center justify-between text-sm">
            <span>{watcher}</span>
            <button
              onClick={() => onRemove(watcher)}
              className="p-1 rounded hover:bg-gray-200"
              title="Remove watcher"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export const EnhancedDeepWorkPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { ticketId } = useParams<{ ticketId: string }>()
  const [activeTab, setActiveTab] = useState<'timeline' | 'related' | 'assets' | 'resolution'>('timeline')
  const [focusMode, setFocusMode] = useState(false)
  const [collapsedPanels, setCollapsedPanels] = useState<string[]>([])
  const [workNote, setWorkNote] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  
  // Multi-tab support
  const [openTickets, setOpenTickets] = useState<OpenTicket[]>([])
  const [activeTicketTab, setActiveTicketTab] = useState<string>(ticketId || '')
  
  // Rich text editor state
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [watchers, setWatchers] = useState<string[]>(['john.doe@company.com', 'jane.smith@company.com'])
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'Check system logs', status: 'completed', assignedTo: 'tech@company.com' },
    { id: '2', title: 'Verify user permissions', status: 'in_progress', assignedTo: 'admin@company.com' },
    { id: '3', title: 'Test connectivity', status: 'open' }
  ])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusMode) return
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleUpdate()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        // Auto-save functionality
        localStorage.setItem(`ticket-draft-${ticketId}`, workNote)
      } else if (e.key === 'Escape') {
        setFocusMode(false)
      }
    }

    if (focusMode) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [focusMode, workNote, ticketId])

  // Auto-save drafts
  useEffect(() => {
    const savedDraft = localStorage.getItem(`ticket-draft-${ticketId}`)
    if (savedDraft) {
      setWorkNote(savedDraft)
    }
  }, [ticketId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (workNote.trim()) {
        localStorage.setItem(`ticket-draft-${ticketId}`, workNote)
      }
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [workNote, ticketId])
  
  const { data, refetch } = useQuery({ 
    queryKey: ['ticket', ticketId], 
    queryFn: () => getTickets({ ticketId: ticketId! }).then(t => t[0]), 
    enabled: !!ticketId 
  })
  
  const { data: assets = [] } = useQuery({
    queryKey: ['ticketAssets', data?.requestedBy.id],
    queryFn: () => getAssetsForUser(data!.requestedBy.id.toString()),
    enabled: !!data
  })
  
  const { data: history = [] } = useQuery({
    queryKey: ['ticketHistory', ticketId],
    queryFn: () => getTicketHistory(ticketId!),
    enabled: !!ticketId
  })
  
  const { data: related } = useQuery({
    queryKey: ['ticketRelated', ticketId],
    queryFn: () => getRelatedItems(ticketId!),
    enabled: !!ticketId
  })

  const [status, setStatus] = useState<string>()

  useEffect(() => {
    if (data) {
      setStatus(data.status)
    }
  }, [data])

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, startTime])

  const startTimer = () => {
    setStartTime(new Date())
    setIsTimerRunning(true)
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleUpdate = async () => {
    if (!workNote.trim()) return
    await updateTicket(ticketId!, { workNote: workNote, timeSpent: timeSpent })
    setWorkNote('')
    setTimeSpent(0)
    localStorage.removeItem(`ticket-draft-${ticketId}`)
    refetch()
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] })
  }

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    await updateTicket(ticketId!, { status: newStatus })
    refetch()
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] })
  }

  const handleResolve = async () => {
    if (!resolutionNote.trim()) return
    await updateTicket(ticketId!, { 
      status: 'resolved', 
      workNote: `Resolution: ${resolutionNote}`,
      timeSpent: timeSpent 
    })
    setResolutionNote('')
    refetch()
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] })
  }

  // Attachment handling
  const handleAttachmentUpload = async (files: FileList) => {
    const newAttachments: Attachment[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const id = `temp-${Date.now()}-${i}`
      
      // Create preview for images
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }
      
      newAttachments.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `temp://${id}`, // Temporary URL until uploaded
        preview
      })
    }
    
    setAttachments(prev => [...prev, ...newAttachments])
    
    // TODO: Implement actual file upload to server
    // const uploadedAttachments = await uploadFiles(files)
    // setAttachments(prev => prev.map(att => uploadedAttachments.find(up => up.id === att.id) || att))
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  // Watcher management
  const addWatcher = async (email: string) => {
    if (!watchers.includes(email)) {
      setWatchers(prev => [...prev, email])
      // TODO: API call to add watcher
      // await addTicketWatcher(ticketId!, email)
    }
  }

  const removeWatcher = async (email: string) => {
    setWatchers(prev => prev.filter(w => w !== email))
    // TODO: API call to remove watcher
    // await removeTicketWatcher(ticketId!, email)
  }

  // Multi-tab functionality
  const openTicketTab = (ticket: { id: string; ticketId: string; title: string; status: string }) => {
    const existingTab = openTickets.find(t => t.id === ticket.id)
    if (!existingTab) {
      const newTab: OpenTicket = {
        ...ticket,
        hasUnsavedChanges: false
      }
      setOpenTickets(prev => [...prev, newTab])
    }
    setActiveTicketTab(ticket.id)
  }

  const closeTicketTab = (ticketTabId: string) => {
    setOpenTickets(prev => prev.filter(t => t.id !== ticketTabId))
    if (activeTicketTab === ticketTabId && openTickets.length > 1) {
      const remainingTabs = openTickets.filter(t => t.id !== ticketTabId)
      setActiveTicketTab(remainingTabs[0]?.id || '')
    }
  }

  // Subtask management
  const toggleSubtaskStatus = (subtaskId: string) => {
    setSubtasks(prev => prev.map(task => 
      task.id === subtaskId 
        ? { ...task, status: task.status === 'completed' ? 'open' : 'completed' }
        : task
    ))
  }

  const calculateProgress = () => {
    const completed = subtasks.filter(t => t.status === 'completed').length
    return subtasks.length > 0 ? (completed / subtasks.length) * 100 : 0
  }

  const togglePanel = (panelId: string) => {
    setCollapsedPanels(prev => 
      prev.includes(panelId) 
        ? prev.filter(id => id !== panelId)
        : [...prev, panelId]
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    )
  }

  // Calculate SLA status
  const now = new Date()
  const dueDate = data.dueDate ? new Date(data.dueDate) : null
  const slaRemaining = dueDate ? Math.max(0, dueDate.getTime() - now.getTime()) : null
  const slaStatus = slaRemaining === null ? 'no_sla' :
                   slaRemaining <= 0 ? 'breached' :
                   slaRemaining <= 2 * 60 * 60 * 1000 ? 'warning' : 'ok'

  const contextualPanels: ContextualPanel[] = [
    {
      id: 'customer-context',
      title: 'Customer Context',
      icon: <User className="w-4 h-4" />,
      position: 'left',
      size: 'md',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Requestor Details</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {data.requestedBy.name}</p>
              <p><span className="font-medium">ID:</span> {data.requestedBy.id}</p>
              {data.vipWeight && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">VIP Customer</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recent Tickets</h4>
            <div className="space-y-1 text-sm">
              {(related?.tickets || []).slice(0, 3).map(t => (
                <div key={t.ticketId} className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                     onClick={() => openTicketTab({
                       id: t.id.toString(),
                       ticketId: t.ticketId,
                       title: t.title,
                       status: t.status
                     })}>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-gray-600">Status: {t.status}</p>
                </div>
              ))}
            </div>
          </div>
          
          <WatcherManager 
            watchers={watchers}
            onAdd={addWatcher}
            onRemove={removeWatcher}
          />
        </div>
      )
    },
    {
      id: 'subtasks-progress',
      title: 'Tasks & Progress',
      icon: <ProgressIcon className="w-4 h-4" />,
      position: 'left',
      size: 'md',
      content: (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Progress</h4>
              <span className="text-sm text-gray-600">{Math.round(calculateProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                data-progress={calculateProgress()}
              />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Subtasks</h4>
            <div className="space-y-2">
              {subtasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <button
                    onClick={() => toggleSubtaskStatus(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {task.status === 'completed' && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      task.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}>
                      {task.title}
                    </p>
                    {task.assignedTo && (
                      <p className="text-xs text-gray-600">{task.assignedTo}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: <Brain className="w-4 h-4" />,
      position: 'right',
      size: 'md',
      content: (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Suggested Actions</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Check network connectivity</li>
              <li>• Verify user permissions</li>
              <li>• Review recent system logs</li>
            </ul>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Knowledge Base</h4>
            <div className="space-y-2">
              <div className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50">
                <p className="text-sm font-medium text-green-800">Troubleshooting Network Issues</p>
                <p className="text-xs text-green-600">KB #1234 - 95% match</p>
              </div>
              <div className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50">
                <p className="text-sm font-medium text-green-800">User Permission Guide</p>
                <p className="text-xs text-green-600">KB #2345 - 87% match</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Escalation Risk</h4>
            <p className="text-sm text-yellow-800">Low - Standard issue pattern</p>
          </div>
        </div>
      )
    },
    {
      id: 'sla-monitor',
      title: 'SLA Monitor',
      icon: <Clock className="w-4 h-4" />,
      position: 'right',
      size: 'sm',
      content: (
        <div className="space-y-3">
          {slaStatus !== 'no_sla' && (
            <div className={`p-3 rounded-lg border ${
              slaStatus === 'breached' ? 'bg-red-50 border-red-200' :
              slaStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${
                  slaStatus === 'breached' ? 'text-red-600' :
                  slaStatus === 'warning' ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
                <span className={`font-medium ${
                  slaStatus === 'breached' ? 'text-red-900' :
                  slaStatus === 'warning' ? 'text-yellow-900' :
                  'text-green-900'
                }`}>
                  {slaStatus === 'breached' ? 'SLA BREACHED' :
                   slaStatus === 'warning' ? 'SLA WARNING' :
                   'SLA ON TRACK'}
                </span>
              </div>
              {slaRemaining && slaRemaining > 0 && (
                <p className="text-sm">
                  {Math.floor(slaRemaining / (1000 * 60 * 60))}h {Math.floor((slaRemaining % (1000 * 60 * 60)) / (1000 * 60))}m remaining
                </p>
              )}
            </div>
          )}
          
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-gray-900 mb-1">
              {formatTime(timeSpent)}
            </div>
            <div className="flex gap-2">
              {!isTimerRunning ? (
                <button
                  onClick={startTimer}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Start Timer
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Stop Timer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className={`min-h-screen bg-gray-50 ${focusMode ? 'p-0' : 'p-4'}`}>
      {/* Multi-tab Header */}
      {openTickets.length > 0 && !focusMode && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {openTickets.map(ticket => (
              <div
                key={ticket.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-t-lg border ${
                  activeTicketTab === ticket.id
                    ? 'bg-blue-50 border-blue-200 border-b-transparent'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => setActiveTicketTab(ticket.id)}
                  className="text-sm font-medium truncate max-w-[200px]"
                >
                  {ticket.ticketId} - {ticket.title}
                </button>
                {ticket.hasUnsavedChanges && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />
                )}
                <button
                  onClick={() => closeTicketTab(ticket.id)}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Close tab"
                  aria-label="Close ticket tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-white border-b border-gray-200 ${focusMode ? 'px-6 py-4' : 'rounded-t-lg px-6 py-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{data.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-gray-600">{data.ticketId}</span>
                {data.vipWeight && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  data.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  data.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {data.priority} priority
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {focusMode && (
              <div className="text-xs text-gray-500 mr-4">
                <div>Keyboard shortcuts:</div>
                <div>Cmd+Enter: Add note • Cmd+S: Save draft • Esc: Exit focus</div>
              </div>
            )}
            
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-3 py-1 border rounded-md text-sm ${
                focusMode 
                  ? 'border-blue-300 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title={focusMode ? 'Exit Focus Mode (Esc)' : 'Enter Focus Mode'}
            >
              {focusMode ? 'Exit Focus' : 'Focus Mode'}
            </button>
            
            <select 
              value={status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              aria-label="Change ticket status"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`flex ${focusMode ? 'h-screen' : 'h-full'}`}>
        {/* Left Sidebar - Contextual Panels */}
        {!focusMode && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            {contextualPanels
              .filter(panel => panel.position === 'left')
              .map(panel => (
                <div key={panel.id} className="border-b border-gray-200">
                  <button
                    onClick={() => togglePanel(panel.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {panel.icon}
                      <span className="font-medium">{panel.title}</span>
                    </div>
                  </button>
                  {!collapsedPanels.includes(panel.id) && (
                    <div className="p-4 pt-0">
                      {panel.content}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          {/* Ticket Description */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {(data as any).description || 'No description provided'}
            </p>
          </div>

          {/* Tabbed Content */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" role="tablist">
              {[
                { id: 'timeline', label: 'Timeline', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'related', label: 'Related Items', icon: <FileText className="w-4 h-4" /> },
                { id: 'assets', label: 'Assets', icon: <Settings className="w-4 h-4" /> },
                { id: 'resolution', label: 'Resolution', icon: <AlertTriangle className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id as 'timeline' | 'related' | 'assets' | 'resolution')}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Activity Timeline</h4>
                <div className="space-y-3">
                  {(history as EnhancedTicketHistoryEntry[]).map((h: EnhancedTicketHistoryEntry, i: number) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{h.user}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                          {h.action === 'comment' && (
                            <WatcherManager
                              watchers={h.watchers || []}
                              onAdd={addWatcher}
                              onRemove={removeWatcher}
                            />
                          )}
                        </div>
                        <div className="text-sm text-gray-700">
                          {h.action === 'comment' && h.isMarkdown ? (
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ 
                                __html: h.content?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>') || ''
                              }}
                            />
                          ) : (
                            <p>{h.action} {h.details ? `- ${h.details}` : ''}</p>
                          )}
                        </div>
                        
                        {/* Show attachments for comments */}
                        {h.attachments && h.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {h.attachments.map(attachment => (
                              <AttachmentPreview
                                key={attachment.id}
                                attachment={attachment}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Show mentions */}
                        {h.mentions && h.mentions.length > 0 && (
                          <div className="mt-2 text-xs text-blue-600">
                            Mentioned: {h.mentions.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* New Comment Section */}
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Add Comment</h5>
                  <RichTextEditor
                    value={workNote}
                    onChange={setWorkNote}
                    placeholder="Add a detailed comment with markdown support..."
                    onAttachment={handleAttachmentUpload}
                    showToolbar={true}
                  />
                  
                  {/* Show pending attachments */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h6 className="text-sm font-medium text-gray-700">Attachments</h6>
                      {attachments.map(attachment => (
                        <AttachmentPreview
                          key={attachment.id}
                          attachment={attachment}
                          onRemove={() => removeAttachment(attachment.id)}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      Supports markdown, @mentions, and file attachments
                    </div>
                    <button
                      onClick={handleUpdate}
                      disabled={!workNote.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'related' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Related Tickets</h4>
                  <div className="space-y-2">
                    {(related?.tickets || []).map(t => (
                      <div key={t.ticketId} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t.title}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            t.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            t.status === 'open' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{t.ticketId}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Related Assets</h4>
                  <div className="space-y-2">
                    {(related?.assets || []).map(a => (
                      <div key={a.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{a.name}</span>
                          <span className="text-sm text-gray-600">{a.assetTag || 'No tag'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'assets' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Customer Assets</h4>
                <div className="space-y-2">
                  {assets.map(a => (
                    <div key={a.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-sm text-gray-600">{a.assetTag || 'No tag'}</span>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No assets found for this customer</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'resolution' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Resolution</h4>
                
                {/* Progress indicator */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">Resolution Progress</span>
                    <span className="text-blue-700">{Math.round(calculateProgress())}% Complete</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      data-progress={calculateProgress()}
                    />
                  </div>
                  <div className="mt-2 text-sm text-blue-800">
                    {subtasks.filter(t => t.status === 'completed').length} of {subtasks.length} tasks completed
                  </div>
                </div>

                <RichTextEditor
                  value={resolutionNote}
                  onChange={setResolutionNote}
                  placeholder="Enter detailed resolution notes with markdown support..."
                  onAttachment={handleAttachmentUpload}
                  showToolbar={true}
                />
                
                {/* Resolution attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h6 className="text-sm font-medium text-gray-700">Resolution Attachments</h6>
                    {attachments.map((attachment: Attachment) => (
                      <AttachmentPreview
                        key={attachment.id}
                        attachment={attachment}
                        onRemove={() => removeAttachment(attachment.id)}
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleResolve}
                    disabled={!resolutionNote.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Resolved
                  </button>
                  
                  <div className="text-xs text-gray-500">
                    Resolution will be posted with {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - AI Assistant & SLA Monitor */}
        {!focusMode && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            {contextualPanels
              .filter(panel => panel.position === 'right')
              .map(panel => (
                <div key={panel.id} className="border-b border-gray-200">
                  <button
                    onClick={() => togglePanel(panel.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {panel.icon}
                      <span className="font-medium">{panel.title}</span>
                    </div>
                  </button>
                  {!collapsedPanels.includes(panel.id) && (
                    <div className="p-4 pt-0">
                      {panel.content}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className={`bg-white border-t border-gray-200 ${focusMode ? 'px-6 py-4' : 'rounded-b-lg px-6 py-4'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-gray-900">Quick Note</h5>
            <div className="text-xs text-gray-500">
              {workNote.length > 0 && `${workNote.length} characters • `}
              Auto-saved every few seconds
            </div>
          </div>
          
          <RichTextEditor
            value={workNote}
            onChange={setWorkNote}
            placeholder="Add a quick work note or detailed update..."
            onAttachment={handleAttachmentUpload}
            showToolbar={!focusMode} // Hide toolbar in focus mode for minimal distraction
          />
          
          {/* Pending attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-gray-700">Attachments ({attachments.length})</h6>
              <div className="grid grid-cols-2 gap-2">
                {attachments.map((attachment: Attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    onRemove={() => removeAttachment(attachment.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Time spent: <span className="font-mono font-medium">{formatTime(timeSpent)}</span>
              </div>
              {focusMode && (
                <div className="text-xs text-gray-500">
                  Cmd+Enter to submit • Cmd+S to save draft
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdate}
                disabled={!workNote.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
