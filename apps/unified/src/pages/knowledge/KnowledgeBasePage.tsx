import { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  BookOpenIcon,
  DocumentTextIcon,
  TagIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { name: 'Getting Started', count: 24, color: 'bg-blue-500' },
    { name: 'Hardware Support', count: 18, color: 'bg-green-500' },
    { name: 'Software Issues', count: 32, color: 'bg-purple-500' },
    { name: 'Network & Connectivity', count: 15, color: 'bg-orange-500' },
    { name: 'Account Management', count: 12, color: 'bg-red-500' },
    { name: 'Policies & Procedures', count: 8, color: 'bg-indigo-500' }
  ]

  const featuredArticles = [
    {
      id: 1,
      title: 'How to Connect to Company VPN',
      excerpt: 'Step-by-step guide to connecting to the company VPN from any device.',
      category: 'Network & Connectivity',
      views: 1234,
      helpful: 45,
      updated: '2 days ago'
    },
    {
      id: 2,
      title: 'Password Reset Guide',
      excerpt: 'Learn how to reset your password and set up two-factor authentication.',
      category: 'Account Management',
      views: 987,
      helpful: 38,
      updated: '1 week ago'
    },
    {
      id: 3,
      title: 'Installing Microsoft Office 365',
      excerpt: 'Complete installation guide for Microsoft Office 365 on Windows and Mac.',
      category: 'Software Issues',
      views: 756,
      helpful: 29,
      updated: '3 days ago'
    }
  ]

  const recentArticles = [
    {
      id: 4,
      title: 'New Employee Onboarding Checklist',
      category: 'Getting Started',
      updated: '1 day ago'
    },
    {
      id: 5,
      title: 'Printer Setup and Troubleshooting',
      category: 'Hardware Support',
      updated: '2 days ago'
    },
    {
      id: 6,
      title: 'Email Configuration for Mobile Devices',
      category: 'Software Issues',
      updated: '4 days ago'
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Find answers and solutions to common questions
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-nova-600 px-4 py-2 text-sm font-medium text-white hover:bg-nova-700 transition-colors">
          <PlusIcon className="h-4 w-4" />
          Suggest Article
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for articles, guides, and solutions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:ring-2 focus:ring-nova-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Categories */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.count} articles
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Articles */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5" />
          Featured Articles
        </h2>
        <div className="space-y-4">
          {featuredArticles.map((article) => (
            <div
              key={article.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white hover:text-nova-600 dark:hover:text-nova-400">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {article.excerpt}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {article.category}
                    </span>
                    <span>{article.views} views</span>
                    <span>{article.helpful} found helpful</span>
                    <span>Updated {article.updated}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recently Updated
        </h2>
        <div className="space-y-3">
          {recentArticles.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white hover:text-nova-600 dark:hover:text-nova-400">
                  {article.title}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {article.category}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                {article.updated}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
