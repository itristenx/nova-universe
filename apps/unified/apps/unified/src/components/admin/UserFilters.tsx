interface UserFiltersProps {
  filters: Record<string, any>
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function UserFilters({ filters, onFiltersChange, onClearFilters }: UserFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <select className="input" value={filters.status || ''} onChange={(e) => onFiltersChange({...filters, status: e.target.value})}>
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select className="input" value={filters.role || ''} onChange={(e) => onFiltersChange({...filters, role: e.target.value})}>
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="agent">Agent</option>
        <option value="user">User</option>
      </select>
      <button onClick={onClearFilters} className="btn btn-secondary">Clear Filters</button>
    </div>
  )
}
