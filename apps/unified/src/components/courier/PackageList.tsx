import React from 'react'
import { Package, PackageStatus } from '../../types/courier'
import { format } from 'date-fns'

// React 19 compatible custom icons
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
)

const TruckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM19.5 18.75a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM3 4.5h11.25a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H3m0-10.5V9a1.5 1.5 0 001.5 1.5h11.25V4.5H3z" />
  </svg>
)

interface PackageListProps {
  packages: Package[]
  loading: boolean
  onPackageUpdate?: (updatedPackage: Package) => void
}

const PackageList: React.FC<PackageListProps> = ({ 
  packages, 
  loading,
  onPackageUpdate
}) => {
  const getStatusIcon = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.RECEIVED:
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case PackageStatus.PROCESSING:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case PackageStatus.READY_FOR_PICKUP:
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
      case PackageStatus.IN_LOCKER:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case PackageStatus.PICKED_UP:
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      default:
        return <TruckIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.RECEIVED:
        return 'bg-blue-100 text-blue-800'
      case PackageStatus.PROCESSING:
        return 'bg-yellow-100 text-yellow-800'
      case PackageStatus.READY_FOR_PICKUP:
        return 'bg-orange-100 text-orange-800'
      case PackageStatus.IN_LOCKER:
        return 'bg-green-100 text-green-800'
      case PackageStatus.PICKED_UP:
        return 'bg-green-100 text-green-800'
      case PackageStatus.RETURNED_TO_SENDER:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: PackageStatus) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by scanning or manually entering a package.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {packages.map((pkg) => (
        <div key={pkg.id} className="px-6 py-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getStatusIcon(pkg.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pkg.trackingNumber}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                    {formatStatus(pkg.status)}
                  </span>
                </div>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>{pkg.recipient.name}</span>
                  <span>•</span>
                  <span>{pkg.recipient.department}</span>
                  <span>•</span>
                  <span className="capitalize">{pkg.carrier.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Received {format(new Date(pkg.createdAt), 'MMM d, h:mm a')}
                </p>
                {pkg.lockerAssignment && (
                  <p className="text-xs text-green-600">
                    Locker {pkg.lockerAssignment.lockerNumber}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  console.log('View package details', pkg.id)
                  // Use onPackageUpdate if provided
                  onPackageUpdate?.(pkg)
                }}
                className="text-violet-600 hover:text-violet-900 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PackageList
