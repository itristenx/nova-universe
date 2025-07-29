import React from 'react'
import { AlertsFeed } from '../components/AlertsFeed'
import { useQuery } from '@tanstack/react-query'
import { getAlerts } from '../lib/api'

export const AlertsPage: React.FC = () => {
  const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: () => getAlerts() })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>
      <AlertsFeed alerts={alerts} />
    </div>
  )
}

