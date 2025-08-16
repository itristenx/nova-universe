import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Badge,
  Switch,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from '@heroui/react';
import {
  LightBulbIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellSlashIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  BookmarkIcon,
  SparklesIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { Ticket } from '../../types';

interface DeepWorkSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  ticketsWorked: string[];
  notesCount: number;
  distractionsBlocked: number;
  productivityScore: number;
  focusBreaks: number;
  goalAchieved: boolean;
  metrics?: {
    sessionMinutes: number;
    ticketCompletionRate: number;
    notesPerHour: number;
    focusEfficiency: number;
  };
}

interface QuickNote {
  id: string;
  content: string;
  timestamp: Date;
  ticketId?: string;
  tags: string[];
}

interface AISuggestion {
  id: string;
  type: 'resolution' | 'related_ticket' | 'knowledge_base' | 'escalation' | 'automation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  resourceUrl?: string;
}

interface Props {
  ticket?: Ticket;
  onSessionEnd?: (session: DeepWorkSession) => void;
}

export const DeepWorkMode: React.FC<Props> = ({ ticket, onSessionEnd }) => {
  // Session state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Focus settings
  const [distractionsBlocked, setDistractionsBlocked] = useState(true);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [sessionGoalMinutes, setSessionGoalMinutes] = useState(60);

  // Notes and suggestions
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  // Session tracking
  const [ticketsWorked, setTicketsWorked] = useState<string[]>([]);
  const [focusBreaks, setFocusBreaks] = useState(0);

  const {
    isOpen: isSessionSummaryOpen,
    onOpen: onSessionSummaryOpen,
    onClose: onSessionSummaryClose,
  } = useDisclosure();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  // AI suggestions generation using Nova Synth
  useEffect(() => {
    let suggestionInterval: NodeJS.Timeout;

    if (isActive && autoSuggestions && ticket) {
      const generateAISuggestions = async () => {
        try {
          const response = await fetch('/api/v2/synth/tools/nova.ai.analyze_ticket', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              title: ticket.title,
              category: ticket.category,
              priority: ticket.priority,
              requesterEmail: ticket.requestedBy?.name || 'Unknown',
              requesterName: ticket.requestedBy?.name || 'Unknown',
            }),
          });

          if (response.ok) {
            const analysis = await response.json();

            const suggestions: AISuggestion[] = [];

            // Convert AI analysis to suggestions
            if (analysis.suggestions) {
              analysis.suggestions.forEach((suggestion: any, index: number) => {
                suggestions.push({
                  id: `ai-${index}`,
                  type: 'resolution',
                  title: 'AI Recommendation',
                  description: suggestion.reason,
                  confidence: 0.85,
                  actionable: true,
                });
              });
            }

            // Add knowledge base suggestions
            const kbResponse = await fetch('/api/v2/synth/tools/nova.lore.semantic_search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                query: `${ticket.title} ${ticket.category || ''} ${ticket.priority}`.substring(
                  0,
                  200,
                ),
                limit: 3,
              }),
            });

            if (kbResponse.ok) {
              const kbResults = await kbResponse.json();
              kbResults.articles?.forEach((article: any, index: number) => {
                suggestions.push({
                  id: `kb-${index}`,
                  type: 'knowledge_base',
                  title: article.title,
                  description: `${article.content.substring(0, 100)}...`,
                  confidence: article.relevance,
                  actionable: true,
                  resourceUrl: `/kb/${article.id}`,
                });
              });
            }

            setAiSuggestions(suggestions);
          }
        } catch (error) {
          console.error('Failed to generate AI suggestions:', error);
          // Fallback to basic suggestions
          setAiSuggestions([
            {
              id: 'fallback',
              type: 'knowledge_base',
              title: 'Search Knowledge Base',
              description: 'Search for solutions related to this issue.',
              confidence: 0.5,
              actionable: true,
              resourceUrl: '/knowledge',
            },
          ]);
        }
      };

      // Generate initial suggestions
      generateAISuggestions();

      // Refresh suggestions every 5 minutes during active session
      suggestionInterval = setInterval(generateAISuggestions, 5 * 60 * 1000);
    }

    return () => {
      if (suggestionInterval) clearInterval(suggestionInterval);
    };
  }, [isActive, autoSuggestions, ticket]);

  // Session management
  const startSession = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setStartTime(new Date());
    setSessionDuration(0);
    setTicketsWorked(ticket ? [ticket.ticketId] : []);
    setQuickNotes([]);
    setFocusBreaks(0);
  }, [ticket]);

  const pauseSession = useCallback(() => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      setFocusBreaks((prev) => prev + 1);
    }
  }, [isPaused]);

  const stopSession = useCallback(() => {
    if (startTime) {
      // Calculate real productivity metrics
      const sessionMinutes = sessionDuration / 60;
      const ticketCompletionRate =
        ticketsWorked.filter((t: any) => t.status === 'completed').length /
        Math.max(ticketsWorked.length, 1);
      const notesRate = (quickNotes.length / Math.max(sessionMinutes, 1)) * 10; // Notes per 10 minutes
      const focusEfficiency = Math.max(0, 1 - focusBreaks / Math.max(sessionMinutes / 30, 1)); // Breaks per 30 min

      // Productivity score calculation (0-100)
      let productivityScore = 0;
      productivityScore += Math.min(30, sessionMinutes * 0.5); // Base time score (max 30 points)
      productivityScore += ticketCompletionRate * 40; // Completion rate (max 40 points)
      productivityScore += Math.min(15, notesRate * 3); // Note-taking activity (max 15 points)
      productivityScore += focusEfficiency * 15; // Focus maintenance (max 15 points)

      // Estimate distractions blocked based on session length and focus breaks
      const expectedDistractions = Math.floor(sessionMinutes / 15); // Expected every 15 minutes
      const actualBreaks = focusBreaks;
      const distractionsBlocked = Math.max(0, expectedDistractions - actualBreaks);

      const session: DeepWorkSession = {
        id: Date.now().toString(),
        startTime,
        endTime: new Date(),
        ticketsWorked,
        notesCount: quickNotes.length,
        distractionsBlocked,
        productivityScore: Math.round(Math.min(100, productivityScore)),
        focusBreaks,
        goalAchieved: sessionDuration >= sessionGoalMinutes * 60,
        metrics: {
          sessionMinutes: Math.round(sessionMinutes),
          ticketCompletionRate: Math.round(ticketCompletionRate * 100),
          notesPerHour: Math.round(notesRate * 6),
          focusEfficiency: Math.round(focusEfficiency * 100),
        },
      };

      onSessionEnd?.(session);
    }

    setIsActive(false);
    setIsPaused(false);
    setSessionDuration(0);
    setStartTime(null);
    onSessionSummaryOpen();
  }, [
    startTime,
    ticketsWorked,
    quickNotes.length,
    sessionDuration,
    focusBreaks,
    sessionGoalMinutes,
    onSessionEnd,
    onSessionSummaryOpen,
  ]);

  // Notes management
  const addQuickNote = useCallback(() => {
    if (currentNote.trim()) {
      const note: QuickNote = {
        id: Date.now().toString(),
        content: currentNote.trim(),
        timestamp: new Date(),
        ticketId: ticket?.ticketId,
        tags: [], // Could be extracted from content
      };
      setQuickNotes((prev) => [note, ...prev]);
      setCurrentNote('');
    }
  }, [currentNote, ticket?.ticketId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.min(100, (sessionDuration / (sessionGoalMinutes * 60)) * 100);
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'resolution':
        return <LightBulbIcon className="h-4 w-4" />;
      case 'knowledge_base':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'escalation':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'automation':
        return <SparklesIcon className="h-4 w-4" />;
      default:
        return <BookmarkIcon className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (confidence: number): 'success' | 'warning' | 'danger' => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with session controls */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Deep Work Mode</h1>
              {isActive && (
                <Badge color={isPaused ? 'warning' : 'success'} variant="flat">
                  {isPaused ? 'Paused' : 'Active'}
                </Badge>
              )}
            </div>

            {ticket && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Working on: <span className="font-medium">#{ticket.ticketId}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Session timer */}
            {isActive && (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                <span className="font-mono text-lg">{formatDuration(sessionDuration)}</span>
                <Progress
                  value={getProgressPercentage()}
                  className="w-20"
                  size="sm"
                  color={getProgressPercentage() >= 100 ? 'success' : 'primary'}
                />
              </div>
            )}

            {/* Session controls */}
            <div className="flex gap-2">
              {!isActive ? (
                <Button
                  color="primary"
                  onPress={startSession}
                  startContent={<PlayIcon className="h-4 w-4" />}
                >
                  Start Session
                </Button>
              ) : (
                <>
                  <Button
                    variant="flat"
                    onPress={pauseSession}
                    startContent={
                      isPaused ? (
                        <PlayIcon className="h-4 w-4" />
                      ) : (
                        <PauseIcon className="h-4 w-4" />
                      )
                    }
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={stopSession}
                    startContent={<StopIcon className="h-4 w-4" />}
                  >
                    End Session
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar for session goal */}
        {isActive && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-gray-600">
              <span>Session Progress</span>
              <span>
                {Math.floor(sessionDuration / 60)}/{sessionGoalMinutes} minutes
              </span>
            </div>
            <Progress
              value={getProgressPercentage()}
              className="w-full"
              color={getProgressPercentage() >= 100 ? 'success' : 'primary'}
            />
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main content area - distraction-free */}
        <div className="flex-1 p-6">
          {ticket ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{ticket.title}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <Chip size="sm" color="primary" variant="flat">
                        #{ticket.ticketId}
                      </Chip>
                      <Chip size="sm" variant="flat">
                        {ticket.priority}
                      </Chip>
                      <Chip size="sm" variant="flat">
                        {ticket.status}
                      </Chip>
                    </div>
                  </div>

                  {distractionsBlocked && (
                    <div className="flex items-center gap-1">
                      <BellSlashIcon className="h-3 w-3" />
                      <span>Distractions Blocked</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardBody>
                <div className="space-y-6">
                  {/* Ticket details would go here */}
                  <div className="text-gray-600 dark:text-gray-400">
                    <p>Ticket content and work area...</p>
                    <p className="mt-4 text-sm">
                      This is the main work area where you can focus on resolving the ticket without
                      distractions. All non-essential UI elements are minimized.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="flex h-full items-center justify-center">
              <CardBody className="text-center">
                <EyeIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-600">
                  Select a ticket to enter Deep Work Mode
                </h3>
                <p className="text-gray-500">
                  Choose a ticket from your queue to start a focused work session
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right sidebar with AI suggestions and notes */}
        <div className="w-80 overflow-y-auto border-l border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-6">
            {/* Session settings */}
            {!isActive && (
              <Card>
                <CardHeader>
                  <h3 className="font-medium">Session Settings</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Block Distractions</label>
                    <Switch
                      isSelected={distractionsBlocked}
                      onValueChange={setDistractionsBlocked}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">AI Suggestions</label>
                    <Switch
                      isSelected={autoSuggestions}
                      onValueChange={setAutoSuggestions}
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm">Session Goal (minutes)</label>
                    <Input
                      type="number"
                      value={sessionGoalMinutes.toString()}
                      onChange={(e) => setSessionGoalMinutes(Number(e.target.value))}
                      size="sm"
                      min="15"
                      max="240"
                    />
                  </div>
                </CardBody>
              </Card>
            )}

            {/* AI Suggestions */}
            {isActive && aiSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    <h3 className="font-medium">AI Suggestions</h3>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  {aiSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="dark:hover:bg-gray-750 cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-2">
                        {getSuggestionIcon(suggestion.type)}
                        <div className="flex-1">
                          <div className="mb-1 flex items-start justify-between">
                            <h4 className="text-sm font-medium">{suggestion.title}</h4>
                            <Badge
                              size="sm"
                              color={getSuggestionColor(suggestion.confidence)}
                              variant="flat"
                            >
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}

            {/* Quick Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <h3 className="font-medium">Quick Notes</h3>
                  {isActive && (
                    <Badge color="primary" variant="flat">
                      {quickNotes.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {/* Add note input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a quick note..."
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    size="sm"
                    minRows={2}
                    maxRows={4}
                  />
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={addQuickNote}
                    isDisabled={!currentNote.trim()}
                    className="w-full"
                  >
                    Add Note
                  </Button>
                </div>

                <Divider />

                {/* Notes list */}
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {quickNotes.map((note) => (
                    <div key={note.id} className="rounded bg-gray-50 p-2 text-xs dark:bg-gray-700">
                      <p className="mb-1 text-gray-800 dark:text-gray-200">{note.content}</p>
                      <span className="text-xs text-gray-500">
                        {note.timestamp.toLocaleTimeString()}
                        {note.ticketId && ` • #${note.ticketId}`}
                      </span>
                    </div>
                  ))}

                  {quickNotes.length === 0 && (
                    <p className="py-4 text-center text-xs text-gray-500">
                      No notes yet. Add your first note above.
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Session stats (when active) */}
            {isActive && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-4 w-4" />
                    <h3 className="font-medium">Session Stats</h3>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded bg-blue-50 p-2 dark:bg-blue-900/20">
                      <div className="text-xs text-blue-600 dark:text-blue-400">Duration</div>
                      <div className="font-mono text-sm">{formatDuration(sessionDuration)}</div>
                    </div>

                    <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
                      <div className="text-xs text-green-600 dark:text-green-400">Notes</div>
                      <div className="font-mono text-sm">{quickNotes.length}</div>
                    </div>

                    <div className="rounded bg-yellow-50 p-2 dark:bg-yellow-900/20">
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">Breaks</div>
                      <div className="font-mono text-sm">{focusBreaks}</div>
                    </div>

                    <div className="rounded bg-purple-50 p-2 dark:bg-purple-900/20">
                      <div className="text-xs text-purple-600 dark:text-purple-400">Progress</div>
                      <div className="font-mono text-sm">
                        {Math.round(getProgressPercentage())}%
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      <Modal isOpen={isSessionSummaryOpen} onClose={onSessionSummaryClose}>
        <ModalContent>
          <ModalHeader>Session Complete! 🎉</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(sessionDuration)}
                </div>
                <p className="text-sm text-gray-600">Total Focus Time</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded bg-blue-50 p-3">
                  <div className="text-lg font-semibold">{quickNotes.length}</div>
                  <div className="text-xs text-gray-600">Notes Created</div>
                </div>

                <div className="rounded bg-green-50 p-3">
                  <div className="text-lg font-semibold">{focusBreaks}</div>
                  <div className="text-xs text-gray-600">Focus Breaks</div>
                </div>
              </div>

              <div className="text-center">
                <Badge
                  color={sessionDuration >= sessionGoalMinutes * 60 ? 'success' : 'warning'}
                  variant="flat"
                  className="text-sm"
                >
                  {sessionDuration >= sessionGoalMinutes * 60
                    ? 'Goal Achieved! 🎯'
                    : 'Keep going next time! 💪'}
                </Badge>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onSessionSummaryClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
