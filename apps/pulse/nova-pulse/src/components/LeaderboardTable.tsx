import React from 'react';
import type { LeaderboardEntry } from '../types';

interface Props {
  leaderboard: LeaderboardEntry[];
}

export const LeaderboardTable: React.FC<Props> = ({ leaderboard }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="border-b px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
            Rank
          </th>
          <th className="border-b px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
            Name
          </th>
          <th className="border-b px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
            XP
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {leaderboard.map((entry, idx) => (
          <tr key={entry.userId} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{idx + 1}</td>
            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
              {entry.name}
            </td>
            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{entry.xpTotal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
