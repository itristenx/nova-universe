export function RecentActivity() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Ticket #123 was updated
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Asset LAPTOP001 was checked out
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Conference Room A was booked
          </span>
        </div>
      </div>
    </div>
  )
}
