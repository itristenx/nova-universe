import React from 'react'
import type { LeaderboardEntry } from '../types'

interface Props {
  leaderboard: LeaderboardEntry[]
}

export const LeaderboardTable: React.FC<Props> = ({ leaderboard }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
            Rank
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
            XP
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {leaderboard.map((entry, idx) => (
          <tr key={entry.userId} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {idx + 1}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {entry.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {entry.xpTotal}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
