import React from 'react'
import { AlertsFeed } from '../components/AlertsFeed'

// Placeholder alerts until API route exists
const sampleAlerts = [
  { id: '1', message: 'Server CPU high', createdAt: new Date().toISOString() },
  { id: '2', message: 'New security incident', createdAt: new Date().toISOString() }
]

export const AlertsPage: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Alerts</h2>
    <AlertsFeed alerts={sampleAlerts} />
  </div>
)
