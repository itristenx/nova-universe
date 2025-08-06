import React from 'react'

interface Props {
  currentQueue: string
  onQueueChange: (queue: string) => void
  queues: string[]
}

export const QueueSwitcher: React.FC<Props> = ({ currentQueue, onQueueChange, queues }) => (
  <div className="w-full max-w-xs">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Queue
    </label>
    <select
      value={currentQueue}
      onChange={(e) => onQueueChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {queues.map((queue) => (
        <option key={queue} value={queue}>
          {queue}
        </option>
      ))}
    </select>
  </div>
)
