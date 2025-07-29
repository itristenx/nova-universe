import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { postXpEvent } from '../lib/api'

export const LeaderboardPage: React.FC = () => {
  const mutation = useMutation({ mutationFn: postXpEvent })

  const awardXp = () => mutation.mutate({ amount: 10, reason: 'test' })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
      <button className="btn-primary" onClick={awardXp}>Award Test XP</button>
    </div>
  )
}
