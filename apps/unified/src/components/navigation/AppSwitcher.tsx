import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Squares2X2Icon,
  ChevronDownIcon,
  CubeIcon,
  MapIcon,
  CloudIcon,
  CpuChipIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  BellIcon,
  UserGroupIcon,
  CircleStackIcon,
  UserIcon,
  TrophyIcon,
  ClockIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface AppSwitcherProps {
  currentApp?: string;
}

interface App {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  available: boolean;
}

const getApps = (t: any): App[] => [
  {
    id: 'unified',
    name: t('apps.novaUnified'),
    description: t('apps.novaUnifiedDesc'),
    href: '/dashboard',
    icon: Squares2X2Icon,
    color: 'bg-nova-600',
    available: true,
  },
  {
    id: 'core',
    name: t('apps.novaCore'),
    description: t('apps.novaCoreDesc'),
    href: '/admin',
    icon: ShieldCheckIcon,
    color: 'bg-blue-600',
    available: true,
  },
  {
    id: 'atlas',
    name: t('apps.novaAtlas'),
    description: t('apps.novaAtlasDesc'),
    href: '/spaces',
    icon: MapIcon,
    color: 'bg-green-600',
    available: true,
  },
  {
    id: 'inventory',
    name: t('apps.novaInventory'),
    description: t('apps.novaInventoryDesc'),
    href: '/assets',
    icon: CubeIcon,
    color: 'bg-purple-600',
    available: true,
  },
  {
    id: 'pulse',
    name: t('apps.novaPulse'),
    description: t('apps.novaPulseDesc'),
    href: '/tickets',
    icon: ChartBarIcon,
    color: 'bg-orange-600',
    available: true,
  },
  {
    id: 'orbit',
    name: t('apps.novaOrbit'),
    description: t('apps.novaOrbitDesc'),
    href: '/portal',
    icon: CloudIcon,
    color: 'bg-indigo-600',
    available: false,
  },
  {
    id: 'lore',
    name: t('apps.novaLore'),
    description: t('apps.novaLoreDesc'),
    href: '/knowledge',
    icon: BookOpenIcon,
    color: 'bg-amber-600',
    available: true,
  },
  {
    id: 'sentinel',
    name: t('apps.novaSentinel'),
    description: t('apps.novaSentinelDesc'),
    href: '/monitoring',
    icon: ClockIcon,
    color: 'bg-red-600',
    available: true,
  },
  {
    id: 'alert',
    name: t('apps.novaAlert'),
    description: t('apps.novaAlertDesc'),
    href: '/alerts',
    icon: BellIcon,
    color: 'bg-yellow-600',
    available: false,
  },
  {
    id: 'synth',
    name: t('apps.novaSynth'),
    description: t('apps.novaSynthDesc'),
    href: '/workflows',
    icon: CpuChipIcon,
    color: 'bg-cyan-600',
    available: false,
  },
  {
    id: 'helix',
    name: t('apps.novaHelix'),
    description: t('apps.novaHelixDesc'),
    href: '/users',
    icon: UserGroupIcon,
    color: 'bg-pink-600',
    available: true,
  },
  {
    id: 'cmdb',
    name: t('apps.novaCMDB'),
    description: t('apps.novaCMDBDesc'),
    href: '/cmdb',
    icon: CircleStackIcon,
    color: 'bg-teal-600',
    available: false,
  },
  {
    id: 'user360',
    name: t('apps.novaUser360'),
    description: t('apps.novaUser360Desc'),
    href: '/profiles',
    icon: UserIcon,
    color: 'bg-slate-600',
    available: false,
  },
  {
    id: 'accend',
    name: t('apps.novaAccend'),
    description: t('apps.novaAccendDesc'),
    href: '/gamification',
    icon: TrophyIcon,
    color: 'bg-emerald-600',
    available: false,
  },
  {
    id: 'courier',
    name: t('apps.novaCourier'),
    description: t('apps.novaCourierDesc'),
    href: '/packages',
    icon: TruckIcon,
    color: 'bg-violet-600',
    available: true,
  },
];

export function AppSwitcher({ currentApp = 'unified' }: AppSwitcherProps) {
  const { t } = useTranslation(['apps']);
  const [isOpen, setIsOpen] = useState(false);

  const apps = getApps(t);
  const currentAppData = apps.find((app) => app.id === currentApp) ?? apps[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        title="Switch application"
      >
        {currentAppData ? (
          <>
            <div
              className={`h-6 w-6 rounded-md ${currentAppData.color} flex items-center justify-center`}
            >
              <currentAppData.icon className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:block">{currentAppData.name}</span>
          </>
        ) : (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <span className="text-xs font-bold text-white">N</span>
            </div>
            <span className="hidden sm:block">Nova</span>
          </>
        )}
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full left-0 z-40 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Nova Universe Applications
              </h3>

              <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto">
                {apps.map((app) => (
                  <div key={app.id} className="relative">
                    {app.available ? (
                      <Link
                        to={app.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 rounded-lg p-3 transition-colors ${
                          app.id === currentApp
                            ? 'bg-nova-50 dark:bg-nova-900/20 border-nova-200 dark:border-nova-700 border'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-md ${app.color} flex flex-shrink-0 items-center justify-center`}
                        >
                          <app.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.name}
                            </p>
                            {app.id === currentApp && (
                              <span className="bg-nova-100 text-nova-800 dark:bg-nova-900 dark:text-nova-200 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {app.description}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex cursor-not-allowed items-center space-x-3 rounded-lg p-3 opacity-50">
                        <div
                          className={`h-8 w-8 rounded-md ${app.color} flex flex-shrink-0 items-center justify-center`}
                        >
                          <app.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.name}
                            </p>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              Coming Soon
                            </span>
                          </div>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {app.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Nova Universe Platform v2.0
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
