import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getXpLeaderboard } from '../lib/api'

export const GamificationPage: React.FC = () => {
  const { data } = useQuery({ queryKey: ['xp', 'me'], queryFn: getXpLeaderboard })
  const xp = data?.me?.xp || 0

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gamification</h2>
      <p>Your Stardust XP: {xp}</p>
    </div>
  )
}
