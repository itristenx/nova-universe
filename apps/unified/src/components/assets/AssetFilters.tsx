import { useAssetStore } from '@stores/assets'

interface AssetFiltersProps {
  filters: Record<string, any>
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function AssetFilters({ filters, onFiltersChange, onClearFilters }: AssetFiltersProps) {
  const { categories, types, locations } = useAssetStore()

  const handleFilterChange = (key: string, value: string) => {
    if (value === '') {
      const { [key]: removed, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({ ...filters, [key]: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select 
            className="input mt-1"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
            <option value="lost">Lost</option>
            <option value="stolen">Stolen</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
          <select 
            className="input mt-1"
            value={filters.condition || ''}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
          >
            <option value="">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select 
            className="input mt-1"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select 
            className="input mt-1"
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <select 
            className="input mt-1"
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignment</label>
          <select 
            className="input mt-1"
            value={filters.assignee || ''}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
          >
            <option value="">All Assets</option>
            <option value="assigned">Assigned Only</option>
            <option value="unassigned">Unassigned Only</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance</label>
          <select 
            className="input mt-1"
            value={filters.maintenanceDue ? 'due' : ''}
            onChange={(e) => handleFilterChange('maintenanceDue', e.target.value === 'due')}
          >
            <option value="">All Assets</option>
            <option value="due">Maintenance Due</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Warranty</label>
          <select 
            className="input mt-1"
            value={filters.warrantyExpiring ? 'expiring' : ''}
            onChange={(e) => handleFilterChange('warrantyExpiring', e.target.value === 'expiring')}
          >
            <option value="">All Assets</option>
            <option value="expiring">Warranty Expiring</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button onClick={onClearFilters} className="btn btn-secondary btn-sm">
          Clear All Filters
        </button>
      </div>
    </div>
  )
}