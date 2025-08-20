import { apiClient } from './api'
import type { ApiResponse } from '@/types'

// Gamification types based on Pulse API structure
export interface XPLeaderboardEntry {
  userId: string
  name: string
  department: string
  xp_total: number
}

export interface TeamLeaderboardEntry {
  team: string
  xp_total: number
}

export interface UserXPData {
  xp: number
}

export interface XPLeaderboardResponse {
  leaderboard: XPLeaderboardEntry[]
  teams: TeamLeaderboardEntry[]
  me: UserXPData
}

export interface XPEventData {
  amount: number
  reason?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export interface UserProfile {
  id: string
  name: string
  department: string
  totalXP: number
  level: number
  currentLevelXP: number
  nextLevelXP: number
  rank: number
  streakDays: number
  achievements: Achievement[]
  weeklyProgress: {
    current: number
    target: number
  }
}

export interface DailyChallengeTask {
  id: string
  title: string
  description: string
  xpReward: number
  category: string
  progress: number
  maxProgress: number
  completed: boolean
  dueDate: string
}

export interface DailyChallenge {
  id: string
  date: string
  tasks: DailyChallengeTask[]
  totalXPAvailable: number
  completedXP: number
  streakDay: number
}

class GamificationService {
  private readonly baseUrl = '/api/v1/pulse'

  /**
   * Get XP leaderboard data including individual and team rankings
   */
  async getLeaderboard(): Promise<XPLeaderboardResponse> {
    const response = await apiClient.get<ApiResponse<XPLeaderboardResponse>>(`${this.baseUrl}/xp`)
    return (response.data.data || response.data) as XPLeaderboardResponse
  }

  /**
   * Award XP to current user
   */
  async awardXP(data: XPEventData): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/xp`, data)
  }

  /**
   * Get user profile with XP, level, achievements etc.
   * This combines data from multiple sources since some gamification features
   * may not be fully implemented in the backend yet
   */
  async getUserProfile(userId?: string): Promise<UserProfile> {
    try {
      // Get XP data from pulse API
      const xpResponse = await this.getLeaderboard()
      const currentUser = xpResponse.me
      const leaderboardEntry = xpResponse.leaderboard.find(entry => entry.userId === userId)
      
      // Calculate level based on XP (simple formula: level = floor(xp / 1000) + 1)
      const totalXP = currentUser.xp
      const level = Math.floor(totalXP / 1000) + 1
      const currentLevelXP = totalXP % 1000
      const nextLevelXP = 1000
      
      // Find rank in leaderboard
      const rank = xpResponse.leaderboard.findIndex(entry => entry.userId === userId) + 1 || 1
      
      // TODO: These would come from additional API endpoints when fully implemented
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'First Ticket',
          description: 'Resolved your first ticket',
          icon: '🎯',
          category: 'milestone',
          points: 50,
          unlockedAt: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'Speed Demon',
          description: 'Resolve 5 tickets in one day',
          icon: '⚡',
          category: 'performance',
          points: 100,
          progress: 3,
          maxProgress: 5
        }
      ]

      return {
        id: userId || 'current',
        name: leaderboardEntry?.name || 'Current User',
        department: leaderboardEntry?.department || 'Unknown',
        totalXP,
        level,
        currentLevelXP,
        nextLevelXP,
        rank,
        streakDays: 5, // TODO: Calculate from API
        achievements: mockAchievements,
        weeklyProgress: {
          current: totalXP % 500, // Mock weekly progress
          target: 500
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Return fallback data
      return {
        id: userId || 'current',
        name: 'Current User',
        department: 'Unknown',
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: 1000,
        rank: 1,
        streakDays: 0,
        achievements: [],
        weeklyProgress: {
          current: 0,
          target: 500
        }
      }
    }
  }

  /**
   * Get today's daily challenges
   * This is a mock implementation until the backend supports this feature
   */
  async getDailyChallenge(): Promise<DailyChallenge> {
    // TODO: Replace with real API call when backend supports daily challenges
    return {
      id: 'daily-' + new Date().toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      tasks: [
        {
          id: '1',
          title: 'Resolve 3 tickets',
          description: 'Complete 3 support tickets today',
          xpReward: 150,
          category: 'productivity',
          progress: 1,
          maxProgress: 3,
          completed: false,
          dueDate: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Update knowledge base',
          description: 'Add or update a knowledge base article',
          xpReward: 100,
          category: 'knowledge',
          progress: 0,
          maxProgress: 1,
          completed: false,
          dueDate: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Help a colleague',
          description: 'Collaborate on a ticket with another agent',
          xpReward: 75,
          category: 'teamwork',
          progress: 0,
          maxProgress: 1,
          completed: false,
          dueDate: new Date().toISOString()
        }
      ],
      totalXPAvailable: 325,
      completedXP: 0,
      streakDay: 5
    }
  }

  /**
   * Complete a daily challenge task
   */
  async completeChallengeTask(taskId: string): Promise<void> {
    // TODO: Implement real API call when backend supports this
    console.log('Completing challenge task:', taskId)
    
    // For now, just award some XP
    await this.awardXP({
      amount: 50,
      reason: `Daily challenge: ${taskId}`
    })
  }

  /**
   * Get achievement progress and unlocked achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    // TODO: Replace with real API call when backend supports achievements
    return [
      {
        id: '1',
        name: 'First Ticket',
        description: 'Resolved your first ticket',
        icon: '🎯',
        category: 'milestone',
        points: 50,
        unlockedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Speed Demon', 
        description: 'Resolve 5 tickets in one day',
        icon: '⚡',
        category: 'performance',
        points: 100,
        progress: 3,
        maxProgress: 5
      },
      {
        id: '3',
        name: 'Team Player',
        description: 'Collaborate on 10 tickets',
        icon: '🤝',
        category: 'teamwork',
        points: 200,
        progress: 7,
        maxProgress: 10
      },
      {
        id: '4',
        name: 'Knowledge Keeper',
        description: 'Create 5 knowledge base articles',
        icon: '📚',
        category: 'knowledge',
        points: 150,
        progress: 2,
        maxProgress: 5
      }
    ]
  }
}

export const gamificationService = new GamificationService()
