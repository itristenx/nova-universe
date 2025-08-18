import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CpuChipIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PrinterIcon,
  ServerStackIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface AssetFormData {
  name: string
  type: string
  serialNumber: string
  model: string
  manufacturer: string
  status: string
  location: string
  assignedTo: string
  description: string
}

const assetTypes = [
  { value: 'laptop', label: 'Laptop', icon: ComputerDesktopIcon },
  { value: 'desktop', label: 'Desktop Computer', icon: ComputerDesktopIcon },
  { value: 'monitor', label: 'Monitor', icon: ComputerDesktopIcon },
  { value: 'phone', label: 'Phone', icon: DevicePhoneMobileIcon },
  { value: 'printer', label: 'Printer', icon: PrinterIcon },
  { value: 'server', label: 'Server', icon: ServerStackIcon },
  { value: 'network', label: 'Network Equipment', icon: CpuChipIcon },
  { value: 'other', label: 'Other', icon: WrenchScrewdriverIcon }
]

const statusOptions = [
  'Active',
  'Inactive', 
  'In Repair',
  'Retired',
  'Lost',
  'Stolen'
]

export default function CreateAssetPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    type: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    status: 'Active',
    location: '',
    assignedTo: '',
    description: ''
  })

  const handleInputChange = (field: keyof AssetFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Asset created successfully!')
      navigate('/assets')
    } catch (error) {
      toast.error('Failed to create asset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/assets')}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          title="Back to Assets"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Asset
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add a new asset to your inventory management system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
                placeholder="Enter asset name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
                title="Select Asset Type"
              >
                <option value="">Select asset type</option>
                {assetTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
                placeholder="Enter serial number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
                title="Select Status"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
              placeholder="Enter asset description"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-nova-600 text-white rounded-lg hover:bg-nova-700 focus:outline-none focus:ring-2 focus:ring-nova-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  )
}
