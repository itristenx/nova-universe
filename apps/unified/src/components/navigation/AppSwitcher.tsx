import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  TruckIcon
} from '@heroicons/react/24/outline'

interface AppSwitcherProps {
  currentApp?: string
}

interface App {
  id: string
  name: string
  description: string
  href: string
  icon: React.ComponentType<any>
  color: string
  available: boolean
}

const getApps = (t: any): App[] => [
  {
    id: 'unified',
    name: t('apps.novaUnified'),
    description: t('apps.novaUnifiedDesc'),
    href: '/dashboard',
    icon: Squares2X2Icon,
    color: 'bg-nova-600',
    available: true
  },
  {
    id: 'core',
    name: t('apps.novaCore'),
    description: t('apps.novaCoreDesc'),
    href: '/admin',
    icon: ShieldCheckIcon,
    color: 'bg-blue-600',
    available: true
  },
  {
    id: 'atlas',
    name: t('apps.novaAtlas'),
    description: t('apps.novaAtlasDesc'),
    href: '/spaces',
    icon: MapIcon,
    color: 'bg-green-600',
    available: true
  },
  {
    id: 'inventory',
    name: t('apps.novaInventory'),
    description: t('apps.novaInventoryDesc'),
    href: '/assets',
    icon: CubeIcon,
    color: 'bg-purple-600',
    available: true
  },
  {
    id: 'pulse',
    name: t('apps.novaPulse'),
    description: t('apps.novaPulseDesc'),
    href: '/tickets',
    icon: ChartBarIcon,
    color: 'bg-orange-600',
    available: true
  },
  {
    id: 'orbit',
    name: t('apps.novaOrbit'),
    description: t('apps.novaOrbitDesc'),
    href: '/portal',
    icon: CloudIcon,
    color: 'bg-indigo-600',
    available: false
  },
  {
    id: 'lore',
    name: t('apps.novaLore'),
    description: t('apps.novaLoreDesc'),
    href: '/knowledge',
    icon: BookOpenIcon,
    color: 'bg-amber-600',
    available: true
  },
  {
    id: 'sentinel',
    name: t('apps.novaSentinel'),
    description: t('apps.novaSentinelDesc'),
    href: '/monitoring',
    icon: ClockIcon,
    color: 'bg-red-600',
    available: true
  },
  {
    id: 'alert',
    name: t('apps.novaAlert'),
    description: t('apps.novaAlertDesc'),
    href: '/alerts',
    icon: BellIcon,
    color: 'bg-yellow-600',
    available: false
  },
  {
    id: 'synth',
    name: t('apps.novaSynth'),
    description: t('apps.novaSynthDesc'),
    href: '/workflows',
    icon: CpuChipIcon,
    color: 'bg-cyan-600',
    available: false
  },
  {
    id: 'helix',
    name: t('apps.novaHelix'),
    description: t('apps.novaHelixDesc'),
    href: '/users',
    icon: UserGroupIcon,
    color: 'bg-pink-600',
    available: true
  },
  {
    id: 'cmdb',
    name: t('apps.novaCMDB'),
    description: t('apps.novaCMDBDesc'),
    href: '/cmdb',
    icon: CircleStackIcon,
    color: 'bg-teal-600',
    available: false
  },
  {
    id: 'user360',
    name: t('apps.novaUser360'),
    description: t('apps.novaUser360Desc'),
    href: '/profiles',
    icon: UserIcon,
    color: 'bg-slate-600',
    available: false
  },
  {
    id: 'accend',
    name: t('apps.novaAccend'),
    description: t('apps.novaAccendDesc'),
    href: '/gamification',
    icon: TrophyIcon,
    color: 'bg-emerald-600',
    available: false
  },
  {
    id: 'courier',
    name: t('apps.novaCourier'),
    description: t('apps.novaCourierDesc'),
    href: '/packages',
    icon: TruckIcon,
    color: 'bg-violet-600',
    available: true
  }
]

export function AppSwitcher({ currentApp = 'unified' }: AppSwitcherProps) {
  const { t } = useTranslation(['apps'])
  const [isOpen, setIsOpen] = useState(false)
  
  const apps = getApps(t)
  const currentAppData = apps.find(app => app.id === currentApp) ?? apps[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Switch application"
      >
        {currentAppData ? (
          <>
            <div className={`w-6 h-6 rounded-md ${currentAppData.color} flex items-center justify-center`}>
              <currentAppData.icon className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block">{currentAppData.name}</span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">N</span>
            </div>
            <span className="hidden sm:block">Nova</span>
          </>
        )}
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Nova Universe Applications
              </h3>
              
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {apps.map((app) => (
                  <div key={app.id} className="relative">
                    {app.available ? (
                      <Link
                        to={app.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          app.id === currentApp
                            ? 'bg-nova-50 dark:bg-nova-900/20 border border-nova-200 dark:border-nova-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-md ${app.color} flex items-center justify-center flex-shrink-0`}>
                          <app.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.name}
                            </p>
                            {app.id === currentApp && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-nova-100 text-nova-800 dark:bg-nova-900 dark:text-nova-200">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {app.description}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center space-x-3 p-3 rounded-lg opacity-50 cursor-not-allowed">
                        <div className={`w-8 h-8 rounded-md ${app.color} flex items-center justify-center flex-shrink-0`}>
                          <app.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.name}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              Coming Soon
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {app.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Nova Universe Platform v2.0
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}