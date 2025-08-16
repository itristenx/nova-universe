import React from 'react';
import type { Alert } from '../types';

interface Props {
  alerts: Alert[];
}

export const AlertsFeed: React.FC<Props> = ({ alerts }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4 text-blue-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{alert.message}</p>
              <p className="mt-1 text-xs opacity-75">{alert.createdAt}</p>
            </div>
          </div>
        </div>
      ))}
      {alerts.length === 0 && (
        <div className="py-8 text-center text-gray-500">No alerts at this time</div>
      )}
    </div>
  </div>
);
