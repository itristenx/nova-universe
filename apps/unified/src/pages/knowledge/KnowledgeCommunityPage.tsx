import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BookOpenIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  HeartIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

// Types
interface Expert {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  expertise: string[];
  totalContributions: number;
  helpfulVotes: number;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  onlineStatus: 'online' | 'offline' | 'busy';
  responseTime: string;
  joinedDate: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: Expert;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  shares: number;
  bookmarks: number;
  createdAt: string;
  updatedAt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  helpfulVotes: number;
  communityRating: number;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  participants: number;
  deadline: string;
  status: 'active' | 'completed';
  progress: number;
}

interface LeaderboardEntry {
  rank: number;
  expert: Expert;
  points: number;
  trend: 'up' | 'down' | 'same';
}

export default function KnowledgeCommunityPage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'experts' | 'challenges' | 'leaderboard'>(
    'articles',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCommunityData = async () => {
      setLoading(true);

      try {
        // Fetch from API
        const response = await fetch('/api/knowledge/community');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
          setExperts(data.experts || []);
          setChallenges(data.challenges || []);
          setLeaderboard(data.leaderboard || []);
        } else {
          // Fallback to empty state if API fails
          setArticles([]);
          setExperts([]);
          setChallenges([]);
          setLeaderboard([]);
        }
      } catch (_error) {
        console.warn('Knowledge community API unavailable, using fallback data:', error);
        // Fallback to empty state
        setArticles([]);
        setExperts([]);
        setChallenges([]);
        setLeaderboard([]);
      }

      setLoading(false);
    };

    loadCommunityData();
  }, []);

  const getBadgeIcon = (level: string) => {
    switch (level) {
      case 'platinum':
        return <StarIconSolid className="h-4 w-4 text-purple-500" />;
      case 'gold':
        return <StarIconSolid className="h-4 w-4 text-yellow-500" />;
      case 'silver':
        return <StarIconSolid className="h-4 w-4 text-gray-400" />;
      default:
        return <StarIconSolid className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8 text-white">
        <div className="relative z-10">
          <h1 className="mb-2 text-3xl font-bold">Knowledge Community</h1>
          <p className="text-purple-100">
            Connect with experts, share knowledge, and grow together
          </p>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <UsersIcon className="h-24 w-24" />
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-3xl font-bold text-blue-600">{articles.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Knowledge Articles</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-3xl font-bold text-green-600">{experts.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Community Experts</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-3xl font-bold text-purple-600">{challenges.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Challenges</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-3xl font-bold text-orange-600">
            {articles.reduce((sum, article) => sum + article.views, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'articles', name: 'Articles', icon: BookOpenIcon },
              { id: 'experts', name: 'Experts', icon: UsersIcon },
              { id: 'challenges', name: 'Challenges', icon: StarIconSolid },
              { id: 'leaderboard', name: 'Leaderboard', icon: StarIconSolid },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/knowledge/new"
                    className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Write Article
                  </Link>
                </div>
              </div>

              {/* Articles List */}
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center space-x-3">
                          <img
                            src={article.author.avatar}
                            alt={article.author.name}
                            className="h-8 w-8 rounded-full bg-gray-200"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {article.author.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {article.author.title} • {article.createdAt}
                            </div>
                          </div>
                          {getBadgeIcon(article.author.badgeLevel)}
                        </div>

                        <Link to={`/knowledge/articles/${article.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-white">
                            {article.title}
                          </h3>
                        </Link>

                        <p className="mt-2 mb-3 text-gray-600 dark:text-gray-400">
                          {article.summary}
                        </p>

                        <div className="mb-3 flex items-center space-x-4 text-sm text-gray-500">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${getDifficultyColor(article.difficulty)}`}
                          >
                            {article.difficulty}
                          </span>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{article.estimatedReadTime} min read</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(article.communityRating)}
                            <span className="ml-1">({article.helpfulVotes})</span>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <button className="flex items-center space-x-1 transition-colors hover:text-red-500">
                            <HeartIcon className="h-4 w-4" />
                            <span>{article.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 transition-colors hover:text-blue-500">
                            <ShareIcon className="h-4 w-4" />
                            <span>{article.shares}</span>
                          </button>
                          <button className="flex items-center space-x-1 transition-colors hover:text-yellow-500">
                            <BookmarkIcon className="h-4 w-4" />
                            <span>{article.bookmarks}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experts Tab */}
          {activeTab === 'experts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {experts.map((expert) => (
                  <div
                    key={expert.id}
                    className="rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700"
                  >
                    <div className="relative mb-4 inline-block">
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="mx-auto h-16 w-16 rounded-full bg-gray-200"
                      />
                      <div
                        className={`absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(expert.onlineStatus)}`}
                      ></div>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white">{expert.name}</h3>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{expert.title}</p>
                    <p className="mb-4 text-xs text-gray-500">{expert.department}</p>

                    <div className="mb-4 flex items-center justify-center space-x-2">
                      {getBadgeIcon(expert.badgeLevel)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {expert.badgeLevel}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Contributions:</span>
                        <span className="font-medium">{expert.totalContributions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Helpful votes:</span>
                        <span className="font-medium">{expert.helpfulVotes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response time:</span>
                        <span className="font-medium">{expert.responseTime}</span>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-1">
                      {expert.expertise.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                        >
                          {skill}
                        </span>
                      ))}
                      {expert.expertise.length > 2 && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          +{expert.expertise.length - 2} more
                        </span>
                      )}
                    </div>

                    <button className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                      <ChatBubbleLeftIcon className="mr-2 h-4 w-4" />
                      Ask Question
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                          {challenge.title}
                        </h3>
                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                          {challenge.description}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getDifficultyColor(challenge.difficulty)}`}
                        >
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full bg-blue-600 transition-all duration-300 ${
                            challenge.progress >= 100
                              ? 'w-full'
                              : challenge.progress >= 75
                                ? 'w-3/4'
                                : challenge.progress >= 50
                                  ? 'w-1/2'
                                  : challenge.progress >= 25
                                    ? 'w-1/4'
                                    : 'w-1/12'
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <StarIconSolid className="h-4 w-4" />
                          <span>{challenge.points} points</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>{challenge.participants} participants</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Due {challenge.deadline}</span>
                      </div>
                    </div>

                    <button className="flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Join Challenge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20">
                <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-400">
                  🏆 Top Contributors This Month
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Recognize our community champions who are making a difference
                </p>
              </div>

              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.expert.id}
                    className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          entry.rank === 1
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.rank === 2
                              ? 'bg-gray-100 text-gray-700'
                              : entry.rank === 3
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {entry.rank}
                      </div>
                    </div>

                    <div className="relative">
                      <img
                        src={entry.expert.avatar}
                        alt={entry.expert.name}
                        className="h-12 w-12 rounded-full bg-gray-200"
                      />
                      <div
                        className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(entry.expert.onlineStatus)}`}
                      ></div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {entry.expert.name}
                        </h4>
                        {getBadgeIcon(entry.expert.badgeLevel)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.expert.title}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {entry.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>

                    <div className="flex-shrink-0">
                      {entry.trend === 'up' ? (
                        <div className="text-green-500">↗</div>
                      ) : entry.trend === 'down' ? (
                        <div className="text-red-500">↘</div>
                      ) : (
                        <div className="text-gray-400">–</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
