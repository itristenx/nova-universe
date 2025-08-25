import { useState } from 'react';
import { cn } from '../../utils';
// Showcase component for Phase 3 features
import { TicketCollaboration } from '../tickets/TicketCollaboration';
import { AssetLifecycleManagement } from '../assets/AssetLifecycleManagement';
import { SpaceManagement } from '../spaces/SpaceManagement';

interface Phase3ShowcaseProps {
  className?: string;
}

export function Phase3Showcase({ className }: Phase3ShowcaseProps) {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'tickets' | 'assets' | 'spaces'>(
    'dashboard',
  );
  const [userRole] = useState<'admin' | 'agent' | 'user'>('admin');

  const modules = [
    {
      id: 'dashboard' as const,
      title: 'Enhanced Dashboard',
      description: 'Interactive widgets with real-time collaboration',
      icon: '📊',
      features: [
        'Customizable widget grid system',
        'Real-time data updates',
        'Drag & drop layout editor',
        'Multiple chart types',
        'Interactive metrics',
        'Activity feeds',
      ],
      status: 'complete',
    },
    {
      id: 'tickets' as const,
      title: 'Ticket Collaboration',
      description: 'Advanced ticketing with real-time collaboration',
      icon: '🎫',
      features: [
        'Real-time comment system',
        'Kanban board view',
        'Advanced filtering',
        'Watcher notifications',
        'Status transitions',
        'Time tracking',
      ],
      status: 'complete',
    },
    {
      id: 'assets' as const,
      title: 'Asset Lifecycle',
      description: 'Complete asset management from purchase to retirement',
      icon: '💻',
      features: [
        'Full lifecycle tracking',
        'Maintenance scheduling',
        'Financial analytics',
        'QR code integration',
        'Depreciation tracking',
        'Compliance reporting',
      ],
      status: 'complete',
    },
    {
      id: 'spaces' as const,
      title: 'Space Management',
      description: 'Interactive floor plans and booking system',
      icon: '🏢',
      features: [
        'Interactive floor plans',
        'Real-time availability',
        'Booking management',
        'Utilization analytics',
        'Maintenance tracking',
        'Capacity optimization',
      ],
      status: 'complete',
    },
  ];

  const currentModule = modules.find((m) => m.id === activeModule);

  const renderModuleOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          Nova Universe Phase 3
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-400">
          Advanced modules with enhanced UI, real-time collaboration, and intelligent automation.
          All components are fully integrated with live APIs for real data flow. Built with React
          18, TypeScript, and modern design principles.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={cn(
              'group cursor-pointer rounded-xl border p-6 transition-all duration-300 hover:shadow-lg',
              activeModule === module.id
                ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
            )}
          >
            {/* Module Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{module.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                </div>
              </div>
              <div
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-medium',
                  module.status === 'complete'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
                )}
              >
                {module.status}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Key Features:</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {module.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
                {module.features.length > 4 && (
                  <li className="text-xs text-gray-500 italic">
                    +{module.features.length - 4} more features...
                  </li>
                )}
              </ul>
            </div>

            {/* Action Button */}
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                className={cn(
                  'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  activeModule === module.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600',
                )}
              >
                {activeModule === module.id ? 'Currently Viewing' : 'Explore Module'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Technology Stack */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          🚀 Technology Stack
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <div className="mb-2 font-medium text-gray-900 dark:text-white">Frontend</div>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Zustand</li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-medium text-gray-900 dark:text-white">Components</div>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• React DnD</li>
              <li>• Recharts</li>
              <li>• Framer Motion</li>
              <li>• Headless UI</li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-medium text-gray-900 dark:text-white">Features</div>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Real-time Updates</li>
              <li>• Dark Mode</li>
              <li>• Responsive Design</li>
              <li>• Accessibility</li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-medium text-gray-900 dark:text-white">Architecture</div>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Component-based</li>
              <li>• Type Safety</li>
              <li>• Performance</li>
              <li>• Scalability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveModule('dashboard')}
            className="text-2xl transition-transform hover:scale-110"
            title="Back to Overview"
          >
            🏠
          </button>

          {currentModule && (
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currentModule.icon}</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentModule.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentModule.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Module Navigation */}
          <div className="flex items-center rounded-lg border border-gray-300 p-1 dark:border-gray-600">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  activeModule === module.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
                title={module.title}
              >
                <span>{module.icon}</span>
                <span className="hidden md:block">{module.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Overview Button */}
          <button
            onClick={() => setActiveModule('dashboard')}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            📋 Overview
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-0 flex-1">
        {activeModule === 'dashboard' && (
          <div className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto p-6">{renderModuleOverview()}</div>
          </div>
        )}

        {activeModule === 'tickets' && <TicketCollaboration className="h-full" />}

        {activeModule === 'assets' && <AssetLifecycleManagement className="h-full" />}

        {activeModule === 'spaces' && <SpaceManagement className="h-full" />}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 text-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <span>👤 Role: {userRole}</span>
          <span>📅 {new Date().toLocaleDateString()}</span>
          <span>🕐 {new Date().toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>Real-time Active</span>
          </span>
          <span>Phase 3 • Build Complete</span>
        </div>
      </div>
    </div>
  );
}
