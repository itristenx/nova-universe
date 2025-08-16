import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  QrCodeIcon,
  TruckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { mailroomService, MailroomPackage, MailroomStats } from '@services/mailroom'
import { cn, formatRelativeTime, formatNumber } from '@utils/index'
import toast from 'react-hot-toast'

export default function MailroomPage() {
  const [packages, setPackages] = useState<MailroomPackage[]>([])
  const [stats, setStats] = useState<MailroomStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedCarrier, setSelectedCarrier] = useState<string>('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 25,
    total: 0
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    searchPackages()
  }, [searchQuery, selectedStatus, selectedCarrier, showOverdueOnly, pagination.page])

  const loadInitialData = async () => {
    try {
      const statsData = await mailroomService.getStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load mailroom stats:', error)
      toast.error('Failed to load mailroom data')
    }
  }

  const searchPackages = async () => {
    setIsLoading(true)
    
    try {
      const filters: any = {}
      
      if (searchQuery) filters.query = searchQuery
      if (selectedStatus) filters.status = [selectedStatus]
      if (selectedCarrier) filters.carrier = [selectedCarrier]
      if (showOverdueOnly) filters.overdue = true

      const result = await mailroomService.searchPackages(
        filters,
        pagination.page,
        pagination.perPage
      )

      setPackages(result.packages)
      setPagination(prev => ({
        ...prev,
        total: result.total
      }))
    } catch (error) {
      console.error('Failed to search packages:', error)
      toast.error('Failed to search packages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (packageId: string, newStatus: string) => {
    try {
      const updatedPackage = await mailroomService.updatePackageStatus(packageId, newStatus)
      
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? updatedPackage : pkg
      ))

      toast.success('Package status updated!')
    } catch (error) {
      toast.error('Failed to update package status')
    }
  }

  const handleScanQR = async () => {
    try {
      // This would integrate with a QR scanner in a real implementation
      toast.info('QR Scanner would open here')
    } catch (error) {
      toast.error('Failed to open QR scanner')
    }
  }

  const generateQRCodes = async (packageIds: string[]) => {
    try {
      const result = await mailroomService.generateQRCodes(packageIds)
      
      // Download the QR codes
      const link = document.createElement('a')
      link.href = result.url
      link.download = result.filename
      link.click()
      
      toast.success('QR codes generated and downloaded!')
    } catch (error) {
      toast.error('Failed to generate QR codes')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      staged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      picked_up: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      escalated: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    }
    return colors[status] || colors.intake
  }

  const getCarrierIcon = (carrier: string) => {
    const icons: Record<string, string> = {
      fedex: '📦',
      ups: '🚚',
      usps: '📮',
      dhl: '✈️',
      amazon: '📦',
      internal: '🏢',
      other: '📦'
    }
    return icons[carrier] || icons.other
  }

  const renderPackageCard = (pkg: MailroomPackage) => (
    <div key={pkg.id} className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getCarrierIcon(pkg.carrier || 'other')}</span>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {pkg.internalPackageId}
            </h3>
            {pkg.trackingNumber && (
              <span className="text-sm text-gray-500">
                ({pkg.trackingNumber})
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              {pkg.recipient.name}
            </div>
            
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              {pkg.location.current}
            </div>
            
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {formatRelativeTime(pkg.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            getStatusColor(pkg.status)
          )}>
            {pkg.status.replace('_', ' ').toUpperCase()}
          </span>
          
          {pkg.priority === 'urgent' && (
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
          )}
          
          {pkg.priority === 'critical' && (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Package Flags */}
      {pkg.flags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {pkg.flags.map((flag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
            >
              {flag.type.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Package Details */}
      <div className="space-y-2 mb-4">
        {pkg.sender && (
          <div className="text-sm">
            <span className="text-gray-500">From:</span> {pkg.sender}
          </div>
        )}
        
        <div className="text-sm">
          <span className="text-gray-500">Type:</span> {pkg.packageType}
        </div>
        
        {pkg.specialInstructions && (
          <div className="text-sm">
            <span className="text-gray-500">Instructions:</span> {pkg.specialInstructions}
          </div>
        )}
        
        {pkg.slaDeadline && new Date(pkg.slaDeadline) < new Date() && (
          <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
            <ClockIcon className="w-4 h-4" />
            Overdue ({formatRelativeTime(pkg.slaDeadline)})
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {pkg.photos.length > 0 && (
            <button className="btn btn-ghost btn-sm">
              <PhotoIcon className="w-4 h-4" />
              {pkg.photos.length}
            </button>
          )}
          
          {pkg.linkedTicketId && (
            <Link 
              to={`/tickets/${pkg.linkedTicketId}`}
              className="btn btn-ghost btn-sm text-blue-600"
            >
              Ticket #{pkg.linkedTicketId}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pkg.status === 'intake' && (
            <button
              onClick={() => handleStatusUpdate(pkg.id, 'staged')}
              className="btn btn-sm btn-secondary"
            >
              Stage
            </button>
          )}
          
          {pkg.status === 'staged' && (
            <button
              onClick={() => handleStatusUpdate(pkg.id, 'in_transit')}
              className="btn btn-sm btn-secondary"
            >
              <TruckIcon className="w-4 h-4" />
              Deliver
            </button>
          )}
          
          {pkg.status === 'delivered' && (
            <button
              onClick={() => handleStatusUpdate(pkg.id, 'picked_up')}
              className="btn btn-sm btn-primary"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Confirm Pickup
            </button>
          )}
          
          <Link 
            to={`/mailroom/packages/${pkg.id}`}
            className="btn btn-sm btn-ghost"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nova Mailroom
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Package tracking and delivery management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleScanQR}
            className="btn btn-secondary"
          >
            <QrCodeIcon className="h-4 w-4" />
            Scan QR
          </button>
          
          <Link to="/mailroom/packages/new" className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            Register Package
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats.today.packagesReceived)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Received Today</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(stats.today.packagesDelivered)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Delivered Today</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(stats.today.pendingPickups)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Pickup</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(stats.today.overduePackages)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.week.slaCompliance}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">SLA Compliance</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search packages, tracking numbers, recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="intake">Intake</option>
              <option value="staged">Staged</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="picked_up">Picked Up</option>
              <option value="lost">Lost</option>
              <option value="returned">Returned</option>
              <option value="escalated">Escalated</option>
            </select>

            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="input"
            >
              <option value="">All Carriers</option>
              <option value="fedex">FedEx</option>
              <option value="ups">UPS</option>
              <option value="usps">USPS</option>
              <option value="dhl">DHL</option>
              <option value="amazon">Amazon</option>
              <option value="internal">Internal</option>
              <option value="other">Other</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Overdue Only</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                'btn btn-sm',
                viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'
              )}
            >
              Cards
            </button>
            
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'btn btn-sm',
                viewMode === 'table' ? 'btn-primary' : 'btn-secondary'
              )}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Package List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading packages..." />
        </div>
      ) : packages.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <TruckIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No packages found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No packages match your current filters
          </p>
          <Link to="/mailroom/packages/new" className="btn btn-primary mt-4">
            <PlusIcon className="h-4 w-4" />
            Register First Package
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map(renderPackageCard)}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.perPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} packages
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.perPage)}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}