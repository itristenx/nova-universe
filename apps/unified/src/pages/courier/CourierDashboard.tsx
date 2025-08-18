import React, { useState, useEffect } from 'react'
import { 
  TruckIcon, 
  MagnifyingGlassIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import { Package, PackageStatus } from '../../types/courier'
import { CourierService } from '../../services/courier/courierService'
import PackageList from '../../components/courier/PackageList'
import StatsOverview from '../../components/courier/StatsOverview'
import QuickActions from '../../components/courier/QuickActions'
import ScannerModal from '../../components/courier/ScannerModal'

const CourierDashboard: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'all'>('all')
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    loadPackages()
  }, [statusFilter])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined
      const data = await CourierService.getPackages(filters)
      setPackages(data)
    } catch (error) {
      console.error('Failed to load packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPackages = packages.filter(pkg => 
    searchTerm === '' || 
    pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.recipient.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePackageUpdate = (updatedPackage: Package) => {
    setPackages(prev => 
      prev.map(pkg => pkg.id === updatedPackage.id ? updatedPackage : pkg)
    )
  }

  const handleScanComplete = (newPackage: Package) => {
    setPackages(prev => [newPackage, ...prev])
    setShowScanner(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <TruckIcon className="h-8 w-8 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nova Courier</h1>
                <p className="text-sm text-gray-500">Package & Mailroom Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowScanner(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                Scan Package
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions onScanPackage={() => setShowScanner(true)} />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search packages, recipients, or tracking numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PackageStatus | 'all')}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-violet-500 focus:border-violet-500 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value={PackageStatus.RECEIVED}>Received</option>
                  <option value={PackageStatus.PROCESSING}>Processing</option>
                  <option value={PackageStatus.READY_FOR_PICKUP}>Ready for Pickup</option>
                  <option value={PackageStatus.IN_LOCKER}>In Locker</option>
                  <option value={PackageStatus.PICKED_UP}>Picked Up</option>
                  <option value={PackageStatus.RETURNED_TO_SENDER}>Returned</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Package List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Packages ({filteredPackages.length})
              </h2>
            </div>
          </div>
          
          <PackageList 
            packages={filteredPackages}
            loading={loading}
            onPackageUpdate={handlePackageUpdate}
          />
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </div>
  )
}

export default CourierDashboard
