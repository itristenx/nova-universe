import React from 'react';
import { motion } from 'framer-motion';
import styles from '../components/TicketGrid.module.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postXpEvent, getXpLeaderboard } from '../lib/api';
import { LeaderboardTable } from '../components/LeaderboardTable';

export const LeaderboardPage: React.FC = () => {
  const mutation = useMutation({ mutationFn: postXpEvent });
  const { data } = useQuery({ queryKey: ['leaderboard'], queryFn: getXpLeaderboard });

  const awardXp = () => mutation.mutate({ amount: 10, reason: 'test' });

  const leaderboard = data?.leaderboard || [];
  const teams = data?.teams || [];

  React.useEffect(() => {
    const handler = () => window.dispatchEvent(new CustomEvent('leaderboard:refresh'));
    window.addEventListener('pulse:pull_to_refresh', handler);
    return () => window.removeEventListener('pulse:pull_to_refresh', handler);
  }, []);

  return (
    <motion.div
      className={styles.pullContainer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="mb-4 text-xl font-semibold">Leaderboard</h2>
      <LeaderboardTable leaderboard={leaderboard} />
      <h3 className="mt-6 text-lg font-semibold">Team Rankings</h3>
      <ul className="list-disc pl-5">
        {teams.map((t) => (
          <li key={t.team}>
            {t.team || 'Unassigned'} - {t.xpTotal} XP
          </li>
        ))}
      </ul>
      <button className="btn-primary mt-4" onClick={awardXp}>
        Award Test XP
      </button>
    </motion.div>
  );
};
