import React from 'react'

interface Alert {
  id: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
}

interface Props {
  alerts: Alert[]
}

export const AlertsFeed: React.FC<Props> = ({ alerts }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border-l-4 ${
            alert.severity === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
            alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
            alert.severity === 'success' ? 'bg-green-50 border-green-400 text-green-700' :
            'bg-blue-50 border-blue-400 text-blue-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{alert.message}</p>
              <p className="text-xs opacity-75 mt-1">{alert.timestamp}</p>
            </div>
          </div>
        </div>
      ))}
      {alerts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No alerts at this time
        </div>
      )}
    </div>
  </div>
)
