import { apiClient } from './api';
import type { ApiResponse } from '@/types';

// Gamification types based on Pulse API structure
export interface XPLeaderboardEntry {
  userId: string;
  name: string;
  department: string;
  xp_total: number;
}

export interface TeamLeaderboardEntry {
  team: string;
  xp_total: number;
}

export interface UserXPData {
  xp: number;
}

export interface XPLeaderboardResponse {
  leaderboard: XPLeaderboardEntry[];
  teams: TeamLeaderboardEntry[];
  me: UserXPData;
}

export interface XPEventData {
  amount: number;
  reason?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  department: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  rank: number;
  streakDays: number;
  achievements: Achievement[];
  weeklyProgress: {
    current: number;
    target: number;
  };
}

export interface DailyChallengeTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  category: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  dueDate: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  tasks: DailyChallengeTask[];
  totalXPAvailable: number;
  completedXP: number;
  streakDay: number;
}

class GamificationService {
  private readonly baseUrl = '/api/v1/pulse';

  /**
   * Get XP leaderboard data including individual and team rankings
   */
  async getLeaderboard(): Promise<XPLeaderboardResponse> {
    const response = await apiClient.get<ApiResponse<XPLeaderboardResponse>>(`${this.baseUrl}/xp`);
    return (response.data.data || response.data) as XPLeaderboardResponse;
  }

  /**
   * Award XP to current user
   */
  async awardXP(data: XPEventData): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/xp`, data);
  }

  /**
   * Get user activity streak data
   */
  async getUserStreak(userId: string): Promise<{ streakDays: number }> {
    const response = await apiClient.get<ApiResponse<{ streakDays: number }>>(
      `${this.baseUrl}/users/${userId}/streak`,
    );
    return (response.data.data || response.data) as { streakDays: number };
  }

  /**
   * Get user weekly progress data
   */
  async getWeeklyProgress(userId: string): Promise<{ current: number; target: number }> {
    const response = await apiClient.get<ApiResponse<{ current: number; target: number }>>(
      `${this.baseUrl}/users/${userId}/weekly-progress`,
    );
    return (response.data.data || response.data) as { current: number; target: number };
  }

  /**
   * Get user profile with XP, level, achievements etc.
   */
  async getUserProfile(userId?: string): Promise<UserProfile> {
    try {
      // Get XP data from pulse API
      const xpResponse = await this.getLeaderboard();
      const currentUser = xpResponse.me;
      const targetUserId = userId || 'current';
      const leaderboardEntry = xpResponse.leaderboard.find(
        (entry) => entry.userId === targetUserId,
      );

      // Calculate level based on XP (simple formula: level = floor(xp / 1000) + 1)
      const totalXP = currentUser.xp;
      const level = Math.floor(totalXP / 1000) + 1;
      const currentLevelXP = totalXP % 1000;
      const nextLevelXP = 1000;

      // Find rank in leaderboard
      const rank =
        xpResponse.leaderboard.findIndex((entry) => entry.userId === targetUserId) + 1 || 1;

      // Get achievements from dedicated API
      const achievements = await this.getAchievements();

      // Get user activity data for streak calculation
      const streakData = await this.getUserStreak(targetUserId);

      // Get weekly progress from API
      const weeklyProgress = await this.getWeeklyProgress(targetUserId);

      return {
        id: targetUserId,
        name: leaderboardEntry?.name || 'Current User',
        department: leaderboardEntry?.department || 'Unknown',
        totalXP,
        level,
        currentLevelXP,
        nextLevelXP,
        rank,
        streakDays: streakData.streakDays,
        achievements,
        weeklyProgress,
      };
    } catch (_error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile data');
    }
  }

  /**
   * Get today's daily challenges
   */
  async getDailyChallenge(): Promise<DailyChallenge> {
    const response = await apiClient.get<ApiResponse<DailyChallenge>>(
      `${this.baseUrl}/daily-challenges`,
    );
    return (response.data.data || response.data) as DailyChallenge;
  }

  /**
   * Complete a daily challenge task
   */
  async completeChallengeTask(taskId: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/daily-challenges/${taskId}/complete`);
  }

  /**
   * Get achievement progress and unlocked achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<ApiResponse<Achievement[]>>(
      `${this.baseUrl}/achievements`,
    );
    return (response.data.data || response.data) as Achievement[];
  }
}

export const gamificationService = new GamificationService();
