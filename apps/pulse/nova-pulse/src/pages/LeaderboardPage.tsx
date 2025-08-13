import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { postXpEvent, getXpLeaderboard } from '../lib/api'
import { LeaderboardTable } from '../components/LeaderboardTable'

export const LeaderboardPage: React.FC = () => {
  const mutation = useMutation({ mutationFn: postXpEvent })
  const { data } = useQuery({ queryKey: ['leaderboard'], queryFn: getXpLeaderboard })

  const awardXp = () => mutation.mutate({ amount: 10, reason: 'test' })

  const leaderboard = data?.leaderboard || []
  const teams = data?.teams || []

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
      <LeaderboardTable leaderboard={leaderboard} />
      <h3 className="text-lg font-semibold mt-6">Team Rankings</h3>
      <ul className="list-disc pl-5">
        {teams.map(t => (
          <li key={t.team}>{t.team || 'Unassigned'} - {t.xpTotal} XP</li>
        ))}
      </ul>
      <button className="btn-primary mt-4" onClick={awardXp}>Award Test XP</button>
    </div>
  )
}
