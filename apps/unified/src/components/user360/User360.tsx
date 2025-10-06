import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  UserIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  TicketIcon,
  ClockIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  LockClosedIcon,
  KeyIcon,
  WifiIcon,
  CpuChipIcon,
  DocumentIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon as TimeIcon,
  SparklesIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { User360ABTests } from './User360ABTests';
import {
  user360Service,
  type User360Profile,
  type AssetItem,
  type SecurityAlert,
  type TicketSummary,
  type ActivityLogEntry,
  type TrainingRecord,
  type UserInteraction,
  type ConversationSession,
  type InteractionStats,
} from '@services/user360Service';

interface User360Props {
  userId?: string;
  className?: string;
}

export function User360({ userId: propUserId, className = '' }: User360Props) {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;

  const [profile, setProfile] = useState<User360Profile | null>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [interactionStats, setInteractionStats] = useState<InteractionStats | null>(null);
  const [conversationSessions, setConversationSessions] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [interactionFilters, setInteractionFilters] = useState({
    channel: '',
    interactionType: '',
    includeAI: true,
    includeSystem: false,
    timeRange: '7d'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Try to load real data first, fall back to mock if API unavailable
      try {
        const profileData = await user360Service.getUserProfile(userId);
        const assetsData = await user360Service.getUserAssets(userId);
        const alertsData = await user360Service.getSecurityAlerts(userId);
        
        // Load interaction data
        const interactionTimelineData = await user360Service.getUserInteractionTimeline(userId, {
          limit: 50,
          ...interactionFilters
        });
        const interactionStatsData = await user360Service.getInteractionStats(userId, interactionFilters.timeRange);

        // Load additional user data
        const ticketsData = await user360Service.getUserTickets(userId);
        const activityLogsData = await user360Service.getActivityLogs(userId);
        const trainingRecordsData = await user360Service.getTrainingRecords(userId);
        const conversationSessionsData = await user360Service.getConversationSessions(userId);

        setProfile(profileData);
        setAssets(assetsData);
        setSecurityAlerts(alertsData);
        setInteractions(interactionTimelineData.interactions);
        setInteractionStats(interactionStatsData);
        setTickets(ticketsData);
        setActivityLogs(activityLogsData);
        setTrainingRecords(trainingRecordsData);
        setConversationSessions(conversationSessionsData);
      } catch (apiError) {
        console.error('User360 API error:', apiError);
        // Clear or set minimal error state without mock data
        setProfile(undefined as any);
        setAssets([]);
        setSecurityAlerts([]);
        setInteractions([]);
        setInteractionStats({
          totalInteractions: 0,
          inboundInteractions: 0,
          outboundInteractions: 0,
          aiGeneratedInteractions: 0,
          systemInteractions: 0,
          avgResponseTime: 0,
          pendingResponses: 0,
          escalatedSessions: 0,
          timeframe: '7d',
          satisfaction: { avgScore: 0, totalRatings: 0 },
        });
        setTickets([]);
        setActivityLogs([]);
        setTrainingRecords([]);
        setConversationSessions([]);
        // Failed to load user data - empty state will be shown
        return;
    } catch (_error) {
      console.error('Failed to load user profile:', _error.message || _error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'compliant':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'disconnected':
      case 'non-compliant':
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'suspended':
      case 'error':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSecurityScore = useMemo(() => {
    if (!profile) return 0;

    let score = 100;
    if (!profile.mfa_enabled) score -= 30;
    if (profile.failed_login_attempts > 0) score -= 10;
    if (
      profile.password_last_changed &&
      Date.now() - profile.password_last_changed.getTime() > 90 * 24 * 60 * 60 * 1000
    ) {
      score -= 20;
    }
    if (securityAlerts.filter((a) => a.status === 'open').length > 0) score -= 15;

    return Math.max(0, score);
  }, [profile, securityAlerts]);

  // Filter interactions based on search and date
  const filteredInteractions = useMemo(() => {
    let filtered = interactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((interaction) =>
        interaction.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date filter
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filtered = filtered.filter((interaction) => {
        const interactionDate = new Date(interaction.timestamp);
        return interactionDate.toDateString() === filterDate.toDateString();
      });
    }

    return filtered;
  }, [interactions, searchTerm, selectedDate]);

  // Filter conversation sessions based on search
  const filteredConversationSessions = useMemo(() => {
    let filtered = conversationSessions;

    if (searchTerm) {
      filtered = filtered.filter((session) =>
        session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [conversationSessions, searchTerm]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'interactions', label: 'Interactions', icon: ChatBubbleLeftRightIcon },
    { id: 'assets', label: 'Assets', icon: DevicePhoneMobileIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'tickets', label: 'Tickets', icon: TicketIcon },
    { id: 'activity', label: 'Activity', icon: ClockIcon },
    { id: 'training', label: 'Training', icon: AcademicCapIcon },
    { id: 'abtests', label: 'A/B Tests', icon: ChartBarIcon },
  ];

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="py-12 text-center">
          <UserIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">User Not Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            The requested user profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-2xl font-bold text-white">
                {profile.first_name[0]}
                {profile.last_name[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.display_name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{profile.title}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(profile.status)}`}
                >
                  {profile.is_online && (
                    <span className="mr-1 h-2 w-2 rounded-full bg-current"></span>
                  )}
                  {profile.status === 'active' && profile.is_online ? 'Online' : profile.status}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.department}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">Security Score</div>
            <div
              className={`text-2xl font-bold ${getSecurityScore >= 80 ? 'text-green-600' : getSecurityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {getSecurityScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <IdentificationIcon className="mr-2 h-5 w-5" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.email}
                    </span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.location.office}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.employee_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-4">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <BuildingOfficeIcon className="mr-2 h-5 w-5" />
                  Organization
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Manager</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.manager ? profile.manager.name : 'Not assigned'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Department
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.department}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Employment Type
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.employment_type}
                    </div>
                  </div>
                  {profile.hire_date && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Hire Date
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Intl.DateTimeFormat('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }).format(profile.hire_date)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Status */}
              <div className="space-y-4">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <ShieldCheckIcon className="mr-2 h-5 w-5" />
                  Security Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <LockClosedIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">MFA Enabled</span>
                    </div>
                    {profile.mfa_enabled ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {profile.last_login && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Last Login
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Intl.DateTimeFormat('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(profile.last_login)}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Failed Logins
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.failed_login_attempts}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-white">
                      <KeyIcon className="h-4 w-4 text-gray-400" />
                      Security Score
                    </div>
                    <div
                      className={`text-sm font-semibold ${getSecurityScore >= 80 ? 'text-green-600' : getSecurityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
                    >
                      {getSecurityScore}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assigned Assets
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {asset.type === 'phone' ? (
                          <WifiIcon className="h-8 w-8 text-blue-600" />
                        ) : (
                          <CpuChipIcon className="h-8 w-8 text-blue-600" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {asset.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.brand} {asset.model}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(asset.compliance_status)}`}
                      >
                        {asset.compliance_status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Serial:</span>
                        <span className="text-gray-900 dark:text-white">
                          {asset.serial_number || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span
                          className={`font-medium ${getStatusColor(asset.status).split(' ')[0]}`}
                        >
                          {asset.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Assigned:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Intl.DateTimeFormat('en-US').format(asset.assigned_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-6">
              {/* Interaction Stats Overview */}
              {interactionStats && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Interactions
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {interactionStats.totalInteractions}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email Interactions
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {interactionStats.byChannel.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center">
                      <SparklesIcon className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          AI Interactions
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {interactionStats.byChannel.ai}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center">
                      <TimeIcon className="h-8 w-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Avg Response Time
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {interactionStats.avgResponseTime}m
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center">
                      <CheckIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Satisfaction Score
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {interactionStats.satisfaction.avgScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search and Date Filters */}
              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search interactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 min-w-0 w-48"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDate('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>

              {/* Interaction Filters */}
              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                </div>
                
                <select
                  value={interactionFilters.channel}
                  onChange={(e) => setInteractionFilters({ ...interactionFilters, channel: e.target.value })}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Channels</option>
                  <option value="EMAIL">Email</option>
                  <option value="WEB_CHAT">Web Chat</option>
                  <option value="MOBILE_CHAT">Mobile Chat</option>
                  <option value="PHONE">Phone</option>
                  <option value="API">API</option>
                </select>
                
                <select
                  value={interactionFilters.interactionType}
                  onChange={(e) => setInteractionFilters({ ...interactionFilters, interactionType: e.target.value })}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="EMAIL_RECEIVED">Email Received</option>
                  <option value="EMAIL_SENT">Email Sent</option>
                  <option value="CHAT_MESSAGE">Chat Message</option>
                  <option value="AI_RESPONSE">AI Response</option>
                  <option value="VOICE_CALL">Voice Call</option>
                </select>
                
                <select
                  value={interactionFilters.timeRange}
                  onChange={(e) => setInteractionFilters({ ...interactionFilters, timeRange: e.target.value })}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactionFilters.includeAI}
                    onChange={(e) => setInteractionFilters({ ...interactionFilters, includeAI: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include AI</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interactionFilters.includeSystem}
                    onChange={(e) => setInteractionFilters({ ...interactionFilters, includeSystem: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include System</span>
                </label>
              </div>

              {/* Interaction Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Interaction Timeline
                </h3>
                
                {filteredInteractions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredInteractions.map((interaction) => (
                      <div
                        key={interaction.id}
                        className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {/* Interaction Icon */}
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              interaction.isAIGenerated 
                                ? 'bg-purple-100 text-purple-600' 
                                : interaction.channel === 'EMAIL'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-green-100 text-green-600'
                            }`}>
                              {interaction.isAIGenerated ? (
                                <SparklesIcon className="h-5 w-5" />
                              ) : interaction.channel === 'EMAIL' ? (
                                <EnvelopeIcon className="h-5 w-5" />
                              ) : (
                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {interaction.subject || `${interaction.interactionType.replace(/_/g, ' ')}`}
                                </h4>
                                
                                {/* Direction Badge */}
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  interaction.direction === 'INBOUND' 
                                    ? 'bg-green-100 text-green-800'
                                    : interaction.direction === 'OUTBOUND'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {interaction.direction}
                                </span>
                                
                                {/* AI Badge */}
                                {interaction.isAIGenerated && (
                                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                    AI Generated
                                  </span>
                                )}
                                
                                {/* Priority Badge */}
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  interaction.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                  interaction.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                  interaction.priority === 'URGENT' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {interaction.priority}
                                </span>
                              </div>
                              
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {interaction.summary || interaction.content?.substring(0, 150) + (interaction.content && interaction.content.length > 150 ? '...' : '')}
                              </p>
                              
                              {/* Metadata */}
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {interaction.channel}
                                </span>
                                {interaction.category && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    • {interaction.category}
                                  </span>
                                )}
                                {interaction.aiSentiment && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    • Sentiment: {interaction.aiSentiment}
                                  </span>
                                )}
                                {interaction.responseTime && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    • Response: {interaction.responseTime}m
                                  </span>
                                )}
                              </div>
                              
                              {/* Tags */}
                              {interaction.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {interaction.tags.slice(0, 5).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {interaction.tags.length > 5 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      +{interaction.tags.length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }).format(interaction.timestamp)}
                            </p>
                            
                            {interaction.requiresResponse && !interaction.respondedAt && (
                              <p className="mt-1 text-xs text-orange-600">
                                Response Required
                              </p>
                            )}
                            
                            {interaction.isResolved && (
                              <p className="mt-1 text-xs text-green-600">
                                Resolved
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ChatBubbleLeftRightIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No interactions found</p>
                  </div>
                )}

                {/* Conversation Sessions */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Conversation Sessions
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredConversationSessions.length} sessions
                    </span>
                  </div>
                  
                  {filteredConversationSessions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredConversationSessions.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {session.topic}
                                </span>
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(session.resolution?.toLowerCase() || 'unknown')}`}>
                                  {session.resolution}
                                </span>
                                <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  {session.sessionType.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {session.summary}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>Channel: {session.channelType.replace('_', ' ')}</span>
                                <span>Messages: {session.messageCount}</span>
                                <span>Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                                <span>Started: {session.startedAt.toLocaleString()}</span>
                                {session.satisfaction && (
                                  <span className="flex items-center gap-1">
                                    Satisfaction: 
                                    <span className={`font-medium ${
                                      session.satisfaction >= 4 ? 'text-green-600' :
                                      session.satisfaction >= 3 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {session.satisfaction}/5
                                    </span>
                                  </span>
                                )}
                              </div>
                              {session.aiPersonality && (
                                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                                  AI Personality: {session.aiPersonality}
                                </div>
                              )}
                              {session.tags && session.tags.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  {session.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <ChatBubbleLeftRightIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No conversation sessions found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security Alerts
              </h3>
              {securityAlerts.length > 0 ? (
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <ExclamationTriangleIcon
                            className={`mt-0.5 h-6 w-6 ${
                              alert.severity === 'critical'
                                ? 'text-red-600'
                                : alert.severity === 'high'
                                  ? 'text-orange-600'
                                  : alert.severity === 'medium'
                                    ? 'text-yellow-600'
                                    : 'text-blue-600'
                            }`}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {alert.description}
                            </p>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {new Intl.DateTimeFormat('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }).format(alert.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => console.log('View alert details:', alert.id)}
                          >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            View
                          </button>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : alert.severity === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : alert.severity === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(alert.status)}`}
                          >
                            {alert.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ShieldCheckIcon className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <p className="text-gray-500 dark:text-gray-400">No security alerts</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Tickets
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {tickets.length} total tickets
                </span>
              </div>
              
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TicketIcon className="h-5 w-5 text-blue-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {ticket.number}
                            </span>
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status.toLowerCase())}`}>
                              {ticket.status}
                            </span>
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              ticket.priority === 'High' ? 'text-red-600 bg-red-100' :
                              ticket.priority === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
                              'text-green-600 bg-green-100'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {ticket.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{ticket.category} • {ticket.subcategory}</span>
                            <span>Assigned to: {ticket.assignedTo}</span>
                            <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                            <span>Updated: {ticket.updatedAt.toLocaleDateString()}</span>
                          </div>
                          {ticket.tags && ticket.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {ticket.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <DocumentIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No recent tickets</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Log</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {activityLogs.length} recent activities
                </span>
              </div>
              
              {activityLogs.length > 0 ? (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 rounded-full p-1 ${
                          log.result === 'Success' ? 'text-green-600 bg-green-100' :
                          log.result === 'Failed' ? 'text-red-600 bg-red-100' :
                          'text-yellow-600 bg-yellow-100'
                        }`}>
                          {log.action === 'Login' ? (
                            <LockClosedIcon className="h-4 w-4" />
                          ) : log.action === 'Password Change' ? (
                            <KeyIcon className="h-4 w-4" />
                          ) : log.action === 'File Access' ? (
                            <DocumentIcon className="h-4 w-4" />
                          ) : log.action === 'VPN Connect' ? (
                            <WifiIcon className="h-4 w-4" />
                          ) : (
                            <ClockIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {log.action}
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {log.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <span>Source: {log.source}</span>
                            <span>IP: {log.ipAddress}</span>
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              log.result === 'Success' ? 'text-green-600 bg-green-100' :
                              log.result === 'Failed' ? 'text-red-600 bg-red-100' :
                              'text-yellow-600 bg-yellow-100'
                            }`}>
                              {log.result}
                            </span>
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {Object.entries(log.details).map(([key, value]) => (
                                <span key={key} className="mr-3">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ClockIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Training & Compliance
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {trainingRecords.length} courses
                </span>
              </div>
              
              {trainingRecords.length > 0 ? (
                <div className="space-y-4">
                  {trainingRecords.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {record.courseName}
                            </span>
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(record.status.toLowerCase())}`}>
                              {record.status}
                            </span>
                            {record.isRequired && (
                              <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {record.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      record.progress === 100 ? 'bg-green-600' :
                                      record.progress >= 50 ? 'bg-blue-600' :
                                      'bg-yellow-600'
                                    }`}
                                    style={{ width: `${record.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {record.progress}%
                                </span>
                              </div>
                            </div>
                            {record.score !== null && (
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-sm font-medium ${
                                    record.score >= record.passingScore ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {record.score}
                                  </span>
                                  <span className="text-xs text-gray-500">/ {record.passingScore}</span>
                                  {record.score >= record.passingScore && (
                                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Category: {record.category}</span>
                            <span>Provider: {record.provider}</span>
                            {record.startedAt && (
                              <span>Started: {record.startedAt.toLocaleDateString()}</span>
                            )}
                            {record.completedAt && (
                              <span>Completed: {record.completedAt.toLocaleDateString()}</span>
                            )}
                            {record.expiresAt && (
                              <span>Expires: {record.expiresAt.toLocaleDateString()}</span>
                            )}
                          </div>
                          {record.tags && record.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {record.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {record.certificateUrl && record.status === 'Completed' && (
                            <div className="mt-3">
                              <a
                                href={record.certificateUrl}
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <DocumentIcon className="h-4 w-4" />
                                View Certificate
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <AcademicCapIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No training records</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'abtests' && <User360ABTests userId={userId} />}
        </div>
      </div>
    </div>
  );
}

export default User360;
