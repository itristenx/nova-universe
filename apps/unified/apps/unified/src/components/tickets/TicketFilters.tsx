interface TicketFiltersProps {
  filters: Record<string, any>
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function TicketFilters({ filters, onFiltersChange, onClearFilters }: TicketFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select className="input mt-1">
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
          <select className="input mt-1">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select className="input mt-1">
            <option value="">All Types</option>
            <option value="incident">Incident</option>
            <option value="request">Request</option>
            <option value="problem">Problem</option>
            <option value="change">Change</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
          <select className="input mt-1">
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onClearFilters} className="btn btn-secondary btn-sm">
          Clear Filters
        </button>
      </div>
    </div>
  )
}
