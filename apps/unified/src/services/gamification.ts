import { apiClient } from './api'

export interface GamificationProfile {
  userId: string
  username: string
  displayName: string
  avatar?: string
  totalXP: number
  currentLevel: number
  nextLevel: number
  xpToNextLevel: number
  xpProgress: number
  rank: number
  totalUsers: number
  title: string
  badges: Badge[]
  achievements: Achievement[]
  streak: {
    current: number
    longest: number
    lastActivity: string
  }
  stats: {
    ticketsResolved: number
    articlesCreated: number
    helpfulRatings: number
    fastResolutions: number
    mentorshipPoints: number
    communityContributions: number
  }
  preferences: {
    showXP: boolean
    showRank: boolean
    showBadges: boolean
    notifications: boolean
  }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'performance' | 'community' | 'knowledge' | 'special' | 'milestone'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  earnedAt: string
  progress?: number
  maxProgress?: number
  isCompleted: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  tier: 1 | 2 | 3 | 4 | 5
  xpReward: number
  earnedAt: string
  requirements: AchievementRequirement[]
  isSecret: boolean
}

export interface AchievementRequirement {
  type: 'ticket_count' | 'xp_threshold' | 'streak_days' | 'badge_count' | 'rating_average' | 'time_based'
  value: number
  description: string
  currentProgress: number
  isCompleted: boolean
}

export interface XPTransaction {
  id: string
  userId: string
  amount: number
  reason: string
  category: 'ticket' | 'knowledge' | 'community' | 'bonus' | 'achievement'
  metadata?: {
    ticketId?: string
    articleId?: string
    badgeId?: string
    achievementId?: string
    multiplier?: number
  }
  createdAt: string
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time'
  category: 'overall' | 'tickets' | 'knowledge' | 'community' | 'streak'
  entries: LeaderboardEntry[]
  userPosition?: LeaderboardEntry
  totalEntries: number
  lastUpdated: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatar?: string
  score: number
  change: number // Position change from previous period
  badges: Badge[]
  level: number
  title: string
}

export interface GamificationConfig {
  xpRates: {
    ticketResolved: number
    ticketFastResolution: number
    articleCreated: number
    articleHelpful: number
    commentHelpful: number
    dailyLogin: number
    streakBonus: number
    mentoring: number
    feedback: number
  }
  levelThresholds: number[]
  titles: Array<{
    level: number
    name: string
    description: string
  }>
  badgeRules: Array<{
    badgeId: string
    requirements: AchievementRequirement[]
    autoAward: boolean
  }>
  streakBonuses: Array<{
    days: number
    multiplier: number
    badgeId?: string
  }>
}

export interface GamificationEvent {
  type: 'xp_earned' | 'badge_earned' | 'achievement_unlocked' | 'level_up' | 'streak_milestone'
  userId: string
  data: {
    amount?: number
    badgeId?: string
    achievementId?: string
    newLevel?: number
    streakDays?: number
    message?: string
  }
  timestamp: string
}

export interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  members: TeamMember[]
  totalXP: number
  averageLevel: number
  rank: number
  badges: Badge[]
  achievements: Achievement[]
  createdAt: string
}

export interface TeamMember {
  userId: string
  username: string
  displayName: string
  avatar?: string
  role: 'member' | 'leader' | 'captain'
  xpContributed: number
  level: number
  joinedAt: string
}

class GamificationService {
  /**
   * Get user's gamification profile
   */
  async getUserProfile(userId?: string): Promise<GamificationProfile> {
    const url = userId ? `/gamification/users/${userId}/profile` : '/gamification/profile'
    const response = await apiClient.get<GamificationProfile>(url)
    return response.data!
  }

  /**
   * Award XP to user
   */
  async awardXP(data: {
    userId?: string
    amount: number
    reason: string
    category: 'ticket' | 'knowledge' | 'community' | 'bonus' | 'achievement'
    metadata?: Record<string, unknown>
  }): Promise<{
    transaction: XPTransaction
    newLevel?: number
    badgesEarned: Badge[]
    achievementsUnlocked: Achievement[]
  }> {
    const response = await apiClient.post('/gamification/xp/award', data)
    return response.data!
  }

  /**
   * Get XP transaction history
   */
  async getXPHistory(
    userId?: string,
    page = 1,
    perPage = 20
  ): Promise<{
    transactions: XPTransaction[]
    total: number
    page: number
    perPage: number
  }> {
    const params = { page, perPage }
    const url = userId ? `/gamification/users/${userId}/xp-history` : '/gamification/xp-history'
    const response = await apiClient.get(url, { params })
    return response.data!
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time' = 'weekly',
    category: 'overall' | 'tickets' | 'knowledge' | 'community' | 'streak' = 'overall',
    limit = 50
  ): Promise<Leaderboard> {
    const params = { period, category, limit }
    const response = await apiClient.get<Leaderboard>('/gamification/leaderboard', { params })
    return response.data!
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId?: string): Promise<Badge[]> {
    const url = userId ? `/gamification/users/${userId}/badges` : '/gamification/badges'
    const response = await apiClient.get<Badge[]>(url)
    return response.data!
  }

  /**
   * Get all available badges
   */
  async getAllBadges(): Promise<Badge[]> {
    const response = await apiClient.get<Badge[]>('/gamification/badges/all')
    return response.data!
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId?: string): Promise<Achievement[]> {
    const url = userId ? `/gamification/users/${userId}/achievements` : '/gamification/achievements'
    const response = await apiClient.get<Achievement[]>(url)
    return response.data!
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/gamification/achievements/all')
    return response.data!
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<GamificationProfile['preferences']>): Promise<GamificationProfile> {
    const response = await apiClient.patch<GamificationProfile>('/gamification/preferences', preferences)
    return response.data!
  }

  /**
   * Get recent gamification events
   */
  async getRecentEvents(userId?: string, limit = 10): Promise<GamificationEvent[]> {
    const params = { limit }
    const url = userId ? `/gamification/users/${userId}/events` : '/gamification/events'
    const response = await apiClient.get<GamificationEvent[]>(url, { params })
    return response.data!
  }

  /**
   * Get gamification statistics
   */
  async getStats(): Promise<{
    totalUsers: number
    totalXPAwarded: number
    totalBadgesEarned: number
    totalAchievementsUnlocked: number
    averageLevel: number
    topPerformers: LeaderboardEntry[]
    recentActivity: GamificationEvent[]
    levelDistribution: Array<{ level: number; count: number }>
    categoryBreakdown: Array<{ category: string; xp: number; percentage: number }>
  }> {
    const response = await apiClient.get('/gamification/stats')
    return response.data!
  }

  /**
   * Get gamification configuration
   */
  async getConfig(): Promise<GamificationConfig> {
    const response = await apiClient.get<GamificationConfig>('/gamification/config')
    return response.data!
  }

  /**
   * Update gamification configuration (admin only)
   */
  async updateConfig(config: Partial<GamificationConfig>): Promise<GamificationConfig> {
    const response = await apiClient.patch<GamificationConfig>('/gamification/config', config)
    return response.data!
  }

  /**
   * Manually award badge (admin only)
   */
  async awardBadge(userId: string, badgeId: string, reason?: string): Promise<Badge> {
    const response = await apiClient.post<Badge>(`/gamification/users/${userId}/badges`, {
      badgeId,
      reason
    })
    return response.data!
  }

  /**
   * Revoke badge (admin only)
   */
  async revokeBadge(userId: string, badgeId: string, reason?: string): Promise<void> {
    await apiClient.delete(`/gamification/users/${userId}/badges/${badgeId}`, {
      data: { reason }
    })
  }

  /**
   * Create custom badge (admin only)
   */
  async createBadge(badge: {
    name: string
    description: string
    icon: string
    category: Badge['category']
    rarity: Badge['rarity']
    requirements?: AchievementRequirement[]
    autoAward?: boolean
  }): Promise<Badge> {
    const response = await apiClient.post<Badge>('/gamification/badges', badge)
    return response.data!
  }

  /**
   * Create custom achievement (admin only)
   */
  async createAchievement(achievement: {
    name: string
    description: string
    icon: string
    category: string
    tier: Achievement['tier']
    xpReward: number
    requirements: AchievementRequirement[]
    isSecret?: boolean
  }): Promise<Achievement> {
    const response = await apiClient.post<Achievement>('/gamification/achievements', achievement)
    return response.data!
  }

  /**
   * Get teams
   */
  async getTeams(): Promise<Team[]> {
    const response = await apiClient.get<Team[]>('/gamification/teams')
    return response.data!
  }

  /**
   * Get team details
   */
  async getTeam(teamId: string): Promise<Team> {
    const response = await apiClient.get<Team>(`/gamification/teams/${teamId}`)
    return response.data!
  }

  /**
   * Create team
   */
  async createTeam(team: {
    name: string
    description?: string
    avatar?: File
  }): Promise<Team> {
    const formData = new FormData()
    formData.append('name', team.name)
    if (team.description) formData.append('description', team.description)
    if (team.avatar) formData.append('avatar', team.avatar)

    const response = await apiClient.post<Team>('/gamification/teams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data!
  }

  /**
   * Join team
   */
  async joinTeam(teamId: string): Promise<Team> {
    const response = await apiClient.post<Team>(`/gamification/teams/${teamId}/join`)
    return response.data!
  }

  /**
   * Leave team
   */
  async leaveTeam(teamId: string): Promise<void> {
    await apiClient.post(`/gamification/teams/${teamId}/leave`)
  }

  /**
   * Get team leaderboard
   */
  async getTeamLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time' = 'weekly'
  ): Promise<Array<{
    team: Team
    rank: number
    totalXP: number
    change: number
  }>> {
    const response = await apiClient.get(`/gamification/teams/leaderboard?period=${period}`)
    return response.data!
  }

  /**
   * Check for new rewards
   */
  async checkRewards(): Promise<{
    newBadges: Badge[]
    newAchievements: Achievement[]
    levelUp?: { oldLevel: number; newLevel: number; newTitle: string }
    streakMilestone?: { days: number; bonus: number }
  }> {
    const response = await apiClient.post('/gamification/check-rewards')
    return response.data!
  }

  /**
   * Calculate XP for action
   */
  calculateXP(action: string, metadata?: Record<string, unknown>, config?: GamificationConfig): number {
    if (!config) return 0

    let baseXP = 0
    
    switch (action) {
      case 'ticket_resolved':
        baseXP = config.xpRates.ticketResolved
        break
      case 'ticket_fast_resolution':
        baseXP = config.xpRates.ticketFastResolution
        break
      case 'article_created':
        baseXP = config.xpRates.articleCreated
        break
      case 'article_helpful':
        baseXP = config.xpRates.articleHelpful
        break
      case 'comment_helpful':
        baseXP = config.xpRates.commentHelpful
        break
      case 'daily_login':
        baseXP = config.xpRates.dailyLogin
        break
      case 'mentoring':
        baseXP = config.xpRates.mentoring
        break
      case 'feedback':
        baseXP = config.xpRates.feedback
        break
      default:
        return 0
    }

    // Apply multipliers
    let multiplier = 1
    if (metadata?.streakMultiplier) multiplier *= metadata.streakMultiplier as number
    if (metadata?.qualityMultiplier) multiplier *= metadata.qualityMultiplier as number
    if (metadata?.urgencyMultiplier) multiplier *= metadata.urgencyMultiplier as number

    return Math.round(baseXP * multiplier)
  }

  /**
   * Get level from XP
   */
  getLevelFromXP(xp: number, config?: GamificationConfig): {
    level: number
    xpForCurrentLevel: number
    xpForNextLevel: number
    progress: number
  } {
    if (!config) {
      return { level: 1, xpForCurrentLevel: 0, xpForNextLevel: 100, progress: 0 }
    }

    let level = 1
    let totalXP = 0

    for (let i = 0; i < config.levelThresholds.length; i++) {
      if (xp >= totalXP + config.levelThresholds[i]) {
        totalXP += config.levelThresholds[i]
        level = i + 2
      } else {
        break
      }
    }

    const xpForCurrentLevel = level === 1 ? 0 : totalXP
    const xpForNextLevel = level <= config.levelThresholds.length 
      ? totalXP + config.levelThresholds[level - 1] 
      : totalXP
    
    const progress = level <= config.levelThresholds.length
      ? ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
      : 100

    return {
      level,
      xpForCurrentLevel,
      xpForNextLevel,
      progress: Math.min(progress, 100)
    }
  }

  /**
   * Get title for level
   */
  getTitleForLevel(level: number, config?: GamificationConfig): string {
    if (!config) return 'Cadet'
    
    const title = config.titles.find(t => t.level <= level)
    return title?.name || 'Cadet'
  }

  /**
   * Export gamification data
   */
  async exportData(format: 'csv' | 'json', filters?: {
    startDate?: string
    endDate?: string
    userIds?: string[]
    categories?: string[]
  }): Promise<{ downloadUrl: string; filename: string }> {
    const response = await apiClient.post<{ downloadUrl: string; filename: string }>('/gamification/export', {
      format,
      filters
    })
    return response.data!
  }
}

export const gamificationService = new GamificationService()