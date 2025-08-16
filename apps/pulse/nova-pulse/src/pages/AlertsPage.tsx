import React from 'react';
import { motion } from 'framer-motion';
import styles from '../components/TicketGrid.module.css';
import AlertDashboard from '../components/alerts/AlertDashboard';

const AlertsPage: React.FC = () => {
  React.useEffect(() => {
    const handler = () => window.dispatchEvent(new CustomEvent('alerts:refresh'))
    window.addEventListener('pulse:pull_to_refresh', handler)
    return () => window.removeEventListener('pulse:pull_to_refresh', handler)
  }, [])

  return (
    <motion.div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 ${styles.pullContainer}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="container mx-auto px-4 py-8">
        <AlertDashboard />
      </div>
    </motion.div>
  );
};

export default AlertsPage;