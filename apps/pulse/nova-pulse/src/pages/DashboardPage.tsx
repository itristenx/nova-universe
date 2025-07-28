import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboard, getTimesheet } from '../lib/api'

export const DashboardPage: React.FC = () => {
  const { data: dashboard } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const { data: timesheet } = useQuery({ queryKey: ['timesheet'], queryFn: () => getTimesheet() })

  if (!dashboard || !timesheet) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">My Tickets</h2>
        <p>Total: {dashboard.myTickets.total}</p>
        <p>Open: {dashboard.myTickets.open}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Timesheet (last entries)</h3>
        <ul className="list-disc pl-5">
          {timesheet.slice(0, 5).map(t => (
            <li key={t.ticketId}>{t.title} - {t.timeSpent}m</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
