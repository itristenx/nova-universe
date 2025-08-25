import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { cn, formatNumber } from '@utils/index';
import toast from 'react-hot-toast';
import ModuleService, { type Module } from '@services/modules';

// Custom icon components for React 19 compatibility
const PuzzlePieceIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
    />
  </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.240.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
    />
  </svg>
);

const StopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
    />
  </svg>
);

export default function ModuleManagementPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setIsLoading(true);
      const modules = await ModuleService.getAll();
      setModules(modules);
    } catch (_error) {
      console.error('Error loading modules:', error);
      const message = error instanceof Error ? error.message : 'Failed to load modules';
      toast.error(message);
      // Set empty array on error to show empty state instead of crash
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    try {
      setIsUpdating(moduleKey);
      const updatedModule = await ModuleService.toggleEnabled(moduleKey, enabled);

      setModules(modules.map((module) => (module.key === moduleKey ? updatedModule : module)));

      toast.success(`Module ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (_error) {
      console.error('Error updating module:', error);
      const message = error instanceof Error ? error.message : 'Failed to update module';
      toast.error(message);
    } finally {
      setIsUpdating(null);
    }
  };

  const updateConfiguration = async (moduleKey: string, configKey: string, value: any) => {
    try {
      // Get current module configurations
      const module = modules.find((m) => m.key === moduleKey);
      if (!module) return;

      // Create updated configurations object
      const configurations = module.configurations.reduce(
        (acc, config) => {
          acc[config.key] = config.key === configKey ? value : config.value;
          return acc;
        },
        {} as Record<string, any>,
      );

      // Update via API
      const updatedModule = await ModuleService.updateConfiguration(moduleKey, configurations);

      // Update local state
      setModules(modules.map((m) => (m.key === moduleKey ? updatedModule : m)));

      toast.success('Configuration updated successfully');
    } catch (_error) {
      console.error('Error updating configuration:', error);
      const message = error instanceof Error ? error.message : 'Failed to update configuration';
      toast.error(message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <StopIcon className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'updating':
        return <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const categories = [...new Set(modules.map((m) => m.category))];
  const statuses = ['active', 'inactive', 'error', 'updating'];

  const filteredModules = modules.filter((module) => {
    const categoryMatch = !categoryFilter || module.category === categoryFilter;
    const statusMatch = !statusFilter || module.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const moduleStats = {
    total: modules.length,
    active: modules.filter((m) => m.status === 'active').length,
    inactive: modules.filter((m) => m.status === 'inactive').length,
    error: modules.filter((m) => m.status === 'error').length,
    enabled: modules.filter((m) => m.enabled).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="Loading modules..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Module Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage system modules, configurations, and health monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadModules} className="btn btn-secondary" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : <ArrowPathIcon className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="card p-4 text-center">
          <div className="text-nova-600 text-2xl font-bold">{formatNumber(moduleStats.total)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Modules</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(moduleStats.active)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {formatNumber(moduleStats.inactive)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{formatNumber(moduleStats.error)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(moduleStats.enabled)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Enabled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Module Filters</h3>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setCategoryFilter('');
                setStatusFilter('');
              }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredModules.map((module) => (
          <div key={module.key} className="card p-6">
            {/* Module Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <PuzzlePieceIcon className="text-nova-600 h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{module.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">v{module.version}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getStatusIcon(module.status)}
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    module.category === 'Core' &&
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                    module.category === 'Security' &&
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    module.category === 'Communication' &&
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    module.category === 'Analytics' &&
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    !['Core', 'Security', 'Communication', 'Analytics'].includes(module.category) &&
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                  )}
                >
                  {module.category}
                </span>
              </div>
            </div>

            {/* Module Description */}
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{module.description}</p>

            {/* Health Status */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                {getHealthIcon(module.health.status)}
                <span className={cn('text-sm font-medium', getHealthColor(module.health.status))}>
                  {module.health.status.charAt(0).toUpperCase() + module.health.status.slice(1)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {module.health.uptime.toFixed(1)}% uptime
              </div>
            </div>

            {/* Dependencies */}
            {module.dependencies.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Dependencies
                </div>
                <div className="flex flex-wrap gap-1">
                  {module.dependencies.map((dep) => (
                    <span
                      key={dep}
                      className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Health Errors */}
            {module.health.errors.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 text-xs font-medium text-red-700 dark:text-red-300">
                  Issues
                </div>
                <div className="space-y-1">
                  {module.health.errors.map((error, index) => (
                    <div
                      key={index}
                      className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    >
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleModule(module.key, !module.enabled)}
                  disabled={isUpdating === module.key}
                  className={cn(
                    'flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                    module.enabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                    isUpdating === module.key && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {isUpdating === module.key ? (
                    <LoadingSpinner size="sm" />
                  ) : module.enabled ? (
                    <StopIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                  <span>{module.enabled ? 'Disable' : 'Enable'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedModule(module);
                  setShowConfigModal(true);
                }}
                className="btn btn-sm btn-secondary"
              >
                <CogIcon className="h-4 w-4" />
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedModule && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="bg-opacity-50 fixed inset-0 bg-black"
              onClick={() => setShowConfigModal(false)}
            />

            <div className="relative max-h-screen w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Configure {selectedModule.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage module settings and configurations
                    </p>
                  </div>

                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="btn btn-sm btn-secondary"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedModule.configurations.map((config) => (
                    <div key={config.key}>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.label}
                      </label>

                      {config.type === 'boolean' ? (
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={config.value}
                            onChange={(e) => {
                              updateConfiguration(selectedModule.key, config.key, e.target.checked);
                            }}
                            className="checkbox"
                            aria-label={config.label}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {config.description}
                          </span>
                        </div>
                      ) : config.type === 'select' ? (
                        <select
                          value={config.value}
                          onChange={(e) => {
                            updateConfiguration(selectedModule.key, config.key, e.target.value);
                          }}
                          className="input"
                          aria-label={config.label}
                        >
                          {config.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={config.type === 'number' ? 'number' : 'text'}
                          value={config.value}
                          onChange={(e) => {
                            updateConfiguration(selectedModule.key, config.key, e.target.value);
                          }}
                          className="input"
                          placeholder={config.description}
                        />
                      )}

                      {config.description && config.type !== 'boolean' && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {config.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <button onClick={() => setShowConfigModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle save
                      toast.success('Configuration saved successfully');
                      setShowConfigModal(false);
                    }}
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
