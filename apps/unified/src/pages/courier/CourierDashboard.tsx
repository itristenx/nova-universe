import React, { useState, useEffect } from 'react';
import { TruckIcon, MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Package, PackageStatus } from '../../types/courier';
import { CourierService } from '../../services/courier/courierService';
import PackageList from '../../components/courier/PackageList';
import StatsOverview from '../../components/courier/StatsOverview';
import QuickActions from '../../components/courier/QuickActions';
import ScannerModal from '../../components/courier/ScannerModal';

const CourierDashboard: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'all'>('all');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadPackages();
  }, [statusFilter]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await CourierService.getPackages(filters);
      setPackages(data);
    } catch (_error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      searchTerm === '' ||
      pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.recipient.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePackageUpdate = (updatedPackage: Package) => {
    setPackages((prev) => prev.map((pkg) => (pkg.id === updatedPackage.id ? updatedPackage : pkg)));
  };

  const handleScanComplete = (newPackage: Package) => {
    setPackages((prev) => [newPackage, ...prev]);
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
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
                className="inline-flex items-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
              >
                <QrCodeIcon className="mr-2 h-4 w-4" />
                Scan Package
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions onScanPackage={() => setShowScanner(true)} />
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="max-w-lg flex-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search packages, recipients, or tracking numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-violet-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PackageStatus | 'all')}
                  className="block w-full rounded-md border border-gray-300 py-2 pr-10 pl-3 text-base focus:border-violet-500 focus:ring-violet-500 focus:outline-none"
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
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
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
  );
};

export default CourierDashboard;
