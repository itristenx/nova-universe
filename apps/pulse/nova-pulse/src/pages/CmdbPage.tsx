import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Network, 
  Server, 
  Monitor, 
  Database, 
  Cloud, 
  Box,
  Globe,
  Building,
  FileText,
  Eye,
  Edit,
  Trash2,
  Activity,
  AlertTriangle,
  CheckCircle,
  Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getCmdbItems, getCiTypes, getCmdbHealth } from '../lib/api';

// Types
interface ConfigurationItem {
  id: string;
  ciId: string;
  name: string;
  displayName?: string;
  description?: string;
  ciType: string;
  ciStatus: string;
  environment?: string;
  criticality?: string;
  location?: string;
  owner?: string;
  technicalOwner?: string;
  serialNumber?: string;
  assetTag?: string;
  manufacturer?: string;
  model?: string;
  createdAt: string;
  updatedAt: string;
  ciType_rel: {
    name: string;
    displayName: string;
    category: string;
    icon?: string;
    color?: string;
  };
}

interface CiType {
  id: string;
  name: string;
  displayName: string;
  category: string;
  icon?: string;
  color?: string;
}

// Icon mapping for CI types
const getIconForCiType = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Hardware': <Server className="h-4 w-4" />,
    'Software': <Box className="h-4 w-4" />,
    'Service': <Globe className="h-4 w-4" />,
    'Virtual': <Cloud className="h-4 w-4" />,
    'Network': <Network className="h-4 w-4" />,
    'Database': <Database className="h-4 w-4" />,
    'Facility': <Building className="h-4 w-4" />,
    'Documentation': <FileText className="h-4 w-4" />
  };

  return iconMap[category] || <Monitor className="h-4 w-4" />;
};

// Status badge colors
const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'Active': 'text-green-700 bg-green-100',
    'Inactive': 'text-gray-700 bg-gray-100',
    'Retired': 'text-red-700 bg-red-100',
    'Under Maintenance': 'text-yellow-700 bg-yellow-100',
    'Development': 'text-blue-700 bg-blue-100',
    'Testing': 'text-purple-700 bg-purple-100'
  };
  
  return statusColors[status] || 'text-gray-700 bg-gray-100';
};

// Criticality badge colors
const getCriticalityColor = (criticality: string) => {
  const criticalityColors: Record<string, string> = {
    'Critical': 'text-red-700 bg-red-100',
    'High': 'text-orange-700 bg-orange-100',
    'Medium': 'text-yellow-700 bg-yellow-100',
    'Low': 'text-green-700 bg-green-100'
  };
  
  return criticalityColors[criticality] || 'text-gray-700 bg-gray-100';
};

export const CmdbPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCiType, setSelectedCiType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch CMDB data
  const { data: cmdbData, isLoading, error } = useQuery({
    queryKey: ['cmdb-items', { 
      search: searchTerm, 
      ciType: selectedCiType, 
      status: selectedStatus,
      page: currentPage 
    }],
    queryFn: () => getCmdbItems({
      search: searchTerm,
      ciType: selectedCiType,
      status: selectedStatus,
      page: currentPage,
      limit: 20
    })
  });

  // Fetch CI types
  const { data: ciTypes = [] } = useQuery({
    queryKey: ['ci-types'],
    queryFn: getCiTypes
  });

  // Fetch CMDB health
  const { data: cmdbHealth } = useQuery({
    queryKey: ['cmdb-health'],
    queryFn: getCmdbHealth
  });

  const cis = cmdbData?.data || [];
  const pagination = cmdbData?.pagination;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCiTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCiType(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCiType('');
    setSelectedStatus('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">Failed to load CMDB data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Management Database</h1>
          <p className="text-gray-600">Manage and track your IT infrastructure components</p>
        </div>
        <div className="flex gap-2">
          <Link to="/support-groups">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Support Groups
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration Item
          </Button>
        </div>
      </div>

      {/* CMDB Health Dashboard */}
      {cmdbHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total CIs</p>
                <p className="text-2xl font-bold">{cmdbHealth.totalCis || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active CIs</p>
                <p className="text-2xl font-bold">{cmdbHealth.activeCis || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Relationships</p>
                <p className="text-2xl font-bold">{cmdbHealth.totalRelationships || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Data Quality</p>
                <p className="text-2xl font-bold">{cmdbHealth.completenessScore || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium mb-4">Search & Filter</h3>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search CIs by name, description, serial number, or asset tag..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedCiType}
              onChange={handleCiTypeFilter}
              className="border border-gray-300 rounded-md px-3 py-2"
              aria-label="Filter by CI Type"
            >
              <option value="">All CI Types</option>
              {ciTypes.map((type: CiType) => (
                <option key={type.id} value={type.id}>
                  {type.displayName}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="border border-gray-300 rounded-md px-3 py-2"
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Retired">Retired</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Development">Development</option>
              <option value="Testing">Testing</option>
            </select>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCiType || selectedStatus) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Items List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Configuration Items</h3>
        </div>
        <div className="p-6">
          {cis.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No configuration items found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* CI Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">CI Number</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Environment</th>
                      <th className="text-left py-2">Criticality</th>
                      <th className="text-left py-2">Owner</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cis.map((ci: ConfigurationItem) => (
                      <tr key={ci.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <code className="text-sm font-mono text-blue-600">{ci.ciId}</code>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            {getIconForCiType(ci.ciType_rel.category)}
                            <div>
                              <p className="font-medium">{ci.name}</p>
                              {ci.displayName && ci.displayName !== ci.name && (
                                <p className="text-sm text-gray-500">{ci.displayName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                            data-color={ci.ciType_rel.color}
                          >
                            {ci.ciType_rel.displayName}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ci.ciStatus)}`}>
                            {ci.ciStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          {ci.environment && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                              {ci.environment}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          {ci.criticality && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCriticalityColor(ci.criticality)}`}>
                              {ci.criticality}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <p className="text-sm">{ci.owner || 'Unassigned'}</p>
                          {ci.technicalOwner && (
                            <p className="text-xs text-gray-500">Tech: {ci.technicalOwner}</p>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!pagination.hasPrev}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!pagination.hasNext}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CmdbPage;
