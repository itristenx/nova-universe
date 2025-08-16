import React from 'react'
import { motion } from 'framer-motion'
import styles from '../components/TicketGrid.module.css'
import { useQuery } from '@tanstack/react-query'
import { getXpLeaderboard } from '../lib/api'

export const GamificationPage: React.FC = () => {
  const { data } = useQuery({ queryKey: ['xp', 'me'], queryFn: getXpLeaderboard })
  const xp = data?.me?.xp || 0

  React.useEffect(() => {
    const handler = () => window.dispatchEvent(new CustomEvent('xp:refresh'))
    window.addEventListener('pulse:pull_to_refresh', handler)
    return () => window.removeEventListener('pulse:pull_to_refresh', handler)
  }, [])

  return (
    <motion.div className={styles.pullContainer} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold mb-4">Gamification</h2>
      <p>Your Stardust XP: {xp}</p>
    </motion.div>
  )
}
