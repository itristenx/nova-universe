import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CubeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  KeyIcon,
  SparklesIcon,
  BeakerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';
import CatalogManagement from './CatalogManagement';
import RequestManagement from './RequestManagement';
import AdminInterface from './AdminInterface';
import ApprovalWorkflowEngine from './ApprovalWorkflowEngine';
import FeatureFlagManager from './FeatureFlagManager';
import SecurityDashboard from './SecurityDashboard';
import MLDashboard from './MLDashboard';
import VisualWorkflowBuilder from './VisualWorkflowBuilder';
import ABTestList from './ABTestingFramework';
import { useCatalogStore } from '../stores/catalogStore';
import { useRBACStore } from '../stores/rbacStore';
import {
  userService,
  roleService,
  approvalService,
  featureFlagService,
  authService,
} from '../services/liveApiServices';
import {
  catalogService as catalogLiveService,
  catalogRequestService as catalogRequestLiveService,
  costCenterService as costCenterLiveService,
} from '../services/catalogLiveServices';

interface ServiceCatalogProps {
  className?: string;
}

const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<
    | 'catalog'
    | 'requests'
    | 'analytics'
    | 'approvals'
    | 'features'
    | 'admin'
    | 'security'
    | 'ml'
    | 'workflow'
    | 'testing'
  >('catalog');
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    categories,
    items,
    requests,
    departmentCostCenters,
    setCategories,
    setItems,
    setRequests,
    setCostCenters,
  } = useCatalogStore();

  const {
    currentUser,
    checkPermission,
    initializeStandardRoles,
    setCurrentUser,
    setUsers,
    setRoles,
    setPermissions,
    setGroups,
    setApprovalFlows,
    setFeatureFlags,
  } = useRBACStore();

  // Load live data from APIs
  useEffect(() => {
    loadProductionData();
  }, []);

  const loadProductionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize standard roles
      initializeStandardRoles();

      // Load current user and authentication state - REQUIRED for production
      try {
        const currentUserData = await authService.getCurrentUser();
        if (!currentUserData) {
          throw new Error('Authentication required. Please log in to access the service catalog.');
        }
        setCurrentUser(currentUserData);
      } catch (authError) {
        console.error('Authentication failed:', authError);
        setError('Authentication required. Please log in to access the service catalog.');
        setLoading(false);
        return;
      }

      // Load all production data from APIs
      try {
        const [
          categoriesData,
          itemsData,
          costCentersData,
          usersData,
          rolesData,
          approvalFlowsData,
          featureFlagsData,
          requestsData,
        ] = await Promise.all([
          catalogLiveService.getCategories(),
          catalogLiveService.getItems(),
          costCenterLiveService.getCostCenters(),
          userService.getUsers(),
          roleService.getRoles(),
          approvalService.getApprovalFlows(),
          featureFlagService.getFeatureFlags(),
          catalogRequestLiveService.getRequests(),
        ]);

        // Set catalog data
        setCategories(categoriesData || []);
        setItems(itemsData.items || []);
        setCostCenters(costCentersData || []);
        setRequests(requestsData.requests || []);

        // Set RBAC data
        setUsers(usersData.users || []);
        setRoles(rolesData || []);
        setApprovalFlows(approvalFlowsData || []);
        setFeatureFlags(featureFlagsData || []);

        console.log('Production data loaded successfully', {
          categories: categoriesData?.length || 0,
          items: itemsData.items?.length || 0,
          requests: requestsData.requests?.length || 0,
          users: usersData.users?.length || 0,
        });
      } catch (apiError) {
        console.error('Failed to load production data from APIs:', apiError);
        setError(
          'Failed to connect to backend services. Please check your network connection and try again.',
        );
        setLoading(false);
        return;
      }

      setIsInitialized(true);
      setRetryCount(0);
    } catch (_error) {
      console.error('Critical error loading production data:', error);
      setError('System unavailable. Please contact your system administrator.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRetryCount((prev) => prev + 1);
    await loadProductionData();
  };

  const tabs = [
    {
      id: 'catalog',
      name: 'Service Catalog',
      icon: CubeIcon,
      description: 'Browse and request services',
      permission: 'catalog:read',
    },
    {
      id: 'requests',
      name: 'My Requests',
      icon: ShoppingCartIcon,
      description: 'Track your service requests',
      permission: 'requests:read',
    },
    {
      id: 'analytics',
      name: 'Analytics & Billing',
      icon: ChartBarIcon,
      description: 'Cost tracking and billing analytics',
      permission: 'analytics:read',
    },
    {
      id: 'approvals',
      name: 'Approval Workflows',
      icon: ClipboardDocumentListIcon,
      description: 'Manage approval processes',
      permission: 'approvals:read',
    },
    {
      id: 'features',
      name: 'Feature Management',
      icon: FlagIcon,
      description: 'Control feature rollouts',
      permission: 'features:read',
    },
    {
      id: 'admin',
      name: 'Administration',
      icon: ShieldCheckIcon,
      description: 'System administration and security',
      permission: 'admin:read',
    },
    {
      id: 'security',
      name: 'Security Dashboard',
      icon: KeyIcon,
      description: 'Security monitoring and threat detection',
      permission: 'security:read',
    },
    {
      id: 'ml',
      name: 'AI Insights',
      icon: SparklesIcon,
      description: 'Machine learning insights and recommendations',
      permission: 'ml:read',
    },
    {
      id: 'workflow',
      name: 'Workflow Designer',
      icon: CogIcon,
      description: 'Visual workflow design and automation',
      permission: 'workflow:read',
    },
    {
      id: 'testing',
      name: 'A/B Testing',
      icon: BeakerIcon,
      description: 'Experiment management and analysis',
      permission: 'testing:read',
    },
  ].filter((tab) => checkPermission(tab.permission));

  const stats = {
    totalItems: items.length,
    totalRequests: requests.length,
    pendingApprovals: requests.filter((r) => r.state === 'pending_approval').length,
    totalValue: items.reduce((sum, item) => sum + item.price, 0),
    monthlyRecurring: items.reduce((sum, item) => sum + (item.recurring_price || 0), 0),
    departments: departmentCostCenters.length,
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-md text-center">
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-100">
              Service Unavailable
            </h2>
            <p className="mb-4 text-red-700 dark:text-red-200">{error}</p>
            {retryCount < 3 && (
              <button
                onClick={refreshData}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
              >
                <ArrowPathIcon className="mr-2 h-4 w-4" />
                Retry Connection ({retryCount + 1}/3)
              </button>
            )}
            {retryCount >= 3 && (
              <p className="text-sm text-red-600 dark:text-red-300">
                Multiple connection attempts failed. Please contact your system administrator.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
          <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            Loading Service Catalog
          </h2>
          <p className="text-slate-600 dark:text-slate-300">Connecting to enterprise services...</p>
          {retryCount > 0 && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Retry attempt {retryCount}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Enterprise Service Catalog
              </h1>
              <button
                onClick={refreshData}
                className="p-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                title="Refresh data"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300">
              Enterprise-grade IT service management with comprehensive catalog, intelligent
              workflows, advanced security monitoring, and AI-powered insights.
            </p>
            {currentUser && (
              <div className="mt-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircleIcon className="mr-1 h-4 w-4" />
                Connected as {currentUser.first_name} {currentUser.last_name} (
                {currentUser.username})
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CubeIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Available Services
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalItems}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCartIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Active Requests
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalRequests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Pending Approval
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.pendingApprovals}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Catalog Value</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        ${stats.totalValue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Monthly Recurring
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        ${stats.monthlyRecurring.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Departments</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.departments}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 rounded-lg bg-white shadow dark:bg-slate-800">
            <div className="border-b border-gray-200 dark:border-slate-700">
              <nav className="flex space-x-8 overflow-x-auto px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300',
                      )}
                      title={tab.description}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-800">
              {activeTab === 'catalog' && <CatalogManagement />}
              {activeTab === 'requests' && <RequestManagement />}
              {activeTab === 'analytics' && (
                <div className="p-6">
                  <h3 className="mb-6 text-2xl font-bold">Analytics & Cost Management</h3>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-6 dark:bg-slate-700">
                      <h4 className="mb-4 text-lg font-semibold">Department Cost Analysis</h4>
                      <div className="space-y-4">
                        {departmentCostCenters.length > 0 ? (
                          departmentCostCenters.map((dept) => (
                            <div key={dept.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{dept.department_name}</p>
                                <p className="text-sm text-gray-500">{dept.cost_center_code}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  ${dept.monthly_budget.toLocaleString()}/mo
                                </p>
                                <p className="text-sm text-gray-500">
                                  ${dept.annual_budget.toLocaleString()}/year
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">
                            No cost centers configured. Contact your administrator.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-6 dark:bg-slate-700">
                      <h4 className="mb-4 text-lg font-semibold">Request Analytics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Requests</span>
                          <span className="font-semibold">{requests.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending Approval</span>
                          <span className="font-semibold text-yellow-600">
                            {requests.filter((r) => r.state === 'pending_approval').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Approved</span>
                          <span className="font-semibold text-green-600">
                            {requests.filter((r) => r.state === 'approved').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivered</span>
                          <span className="font-semibold text-blue-600">
                            {requests.filter((r) => r.state === 'delivered').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'approvals' && <ApprovalWorkflowEngine />}
              {activeTab === 'features' && <FeatureFlagManager />}
              {activeTab === 'admin' && <AdminInterface />}
              {activeTab === 'security' && <SecurityDashboard />}
              {activeTab === 'ml' && <MLDashboard />}
              {activeTab === 'workflow' && (
                <VisualWorkflowBuilder onSave={() => {}} onCancel={() => {}} />
              )}
              {activeTab === 'testing' && (
                <ABTestList
                  onCreateTest={() => {}}
                  onEditTest={() => {}}
                  onViewResults={() => {}}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ServiceCatalog;
