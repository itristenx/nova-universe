import React from 'react'
import { motion } from 'framer-motion'
import styles from '../components/TicketGrid.module.css'
import { useQuery } from '@tanstack/react-query'
import { getInventory } from '../lib/api'

export const InventoryPage: React.FC = () => {
  const { data: assets = [], refetch } = useQuery({ queryKey: ['inventory'], queryFn: getInventory })

  React.useEffect(() => {
    const handler = () => refetch()
    window.addEventListener('pulse:pull_to_refresh', handler)
    return () => window.removeEventListener('pulse:pull_to_refresh', handler)
  }, [refetch])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`overflow-x-auto ${styles.pullContainer}`}>
        <h2 className="text-xl font-semibold mb-4">Inventory</h2>
        <ul className="list-disc pl-5">
          {assets.map(asset => (
            <li key={asset.id}>{asset.name} ({asset.assetTag || 'n/a'}) - {asset.type}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
