import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Squares2X2Icon,
  ChevronDownIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  StarIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@stores/auth';
import { enhancedAppSwitcherService, type CustomApp } from '@services/enhancedAppSwitcher';

interface EnhancedAppSwitcherProps {
  currentApp?: string;
  showAdminOptions?: boolean;
}

export function EnhancedAppSwitcher({
  currentApp = 'unified',
  showAdminOptions = false,
}: EnhancedAppSwitcherProps) {
  const { t } = useTranslation(['apps']);
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [apps, setApps] = useState<CustomApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadUserApps();
      loadFavorites();
    }
  }, [user]);

  const loadUserApps = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userApps = await enhancedAppSwitcherService.getUserApps(user.id);
      setApps(userApps);
    } catch (_error) {
      console.error('Failed to load user apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const stored = localStorage.getItem(`nova_favorites_${user?.id}`);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const toggleFavorite = (appId: string) => {
    const newFavorites = favorites.includes(appId)
      ? favorites.filter((id) => id !== appId)
      : [...favorites, appId];

    setFavorites(newFavorites);
    if (user) {
      localStorage.setItem(`nova_favorites_${user.id}`, JSON.stringify(newFavorites));
    }
  };

  const handleAppLaunch = async (app: CustomApp) => {
    if (!user) return;

    try {
      // Track app access
      await enhancedAppSwitcherService.trackAppAccess(app.id, user.id);

      if (app.type === 'external') {
        // Generate launch URL for external apps
        const launchData = await enhancedAppSwitcherService.generateAppLaunchUrl(app.id, user.id);

        if (launchData.requires_new_window) {
          window.open(launchData.url, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = launchData.url;
        }
      } else {
        // Internal navigation
        window.location.href = app.url;
      }
    } catch (_error) {
      console.error('Failed to launch app:', error);
    }
  };

  const currentAppData = apps.find((app) => app.id === currentApp);
  const favoriteApps = apps.filter((app) => favorites.includes(app.id));
  const recentApps = apps.filter((app) => !favorites.includes(app.id)).slice(0, 6);

  const getAppIcon = (app: CustomApp) => {
    if (app.iconUrl) {
      return <img src={app.iconUrl} alt={app.name} className="h-4 w-4" />;
    }

    // Default icons based on app type
    switch (app.type) {
      case 'external':
        return <ArrowTopRightOnSquareIcon className="h-4 w-4 text-white" />;
      case 'saml':
        return <ShieldCheckIcon className="h-4 w-4 text-white" />;
      case 'oauth':
        return <UserGroupIcon className="h-4 w-4 text-white" />;
      default:
        return <Squares2X2Icon className="h-4 w-4 text-white" />;
    }
  };

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
              {getAppIcon(currentAppData)}
            </div>
            <span className="hidden sm:block">{currentAppData.name}</span>
          </>
        ) : (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <span className="text-xs font-bold text-white">N</span>
            </div>
            <span className="hidden sm:block">Nova Universe</span>
          </>
        )}
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Applications</h3>
              {showAdminOptions && (
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Manage applications"
                  aria-label="Manage applications"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex animate-pulse items-center space-x-3 p-2">
                    <div className="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1">
                      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="mt-1 h-2 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Favorites Section */}
                {favoriteApps.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center space-x-2">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Favorites
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {favoriteApps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => handleAppLaunch(app)}
                          className="group flex items-center space-x-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div
                            className={`h-8 w-8 rounded-md ${app.color} flex flex-shrink-0 items-center justify-center`}
                          >
                            {getAppIcon(app)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {app.name}
                            </div>
                            <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {app.type === 'external' && (
                                <span className="inline-flex items-center">
                                  <ArrowTopRightOnSquareIcon className="mr-1 h-3 w-3" />
                                  External
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(app.id);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label={`${favorites.includes(app.id) ? 'Remove from' : 'Add to'} favorites`}
                          >
                            <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                          </button>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Apps Section */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center space-x-2">
                    <Squares2X2Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      All Apps
                    </span>
                  </div>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {apps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleAppLaunch(app)}
                        className="group flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div
                          className={`h-8 w-8 rounded-md ${app.color} flex flex-shrink-0 items-center justify-center`}
                        >
                          {getAppIcon(app)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {app.name}
                            </span>
                            {app.type === 'external' && (
                              <ArrowTopRightOnSquareIcon className="h-3 w-3 text-gray-400" />
                            )}
                            {app.type === 'saml' && (
                              <ShieldCheckIcon className="h-3 w-3 text-blue-500" />
                            )}
                            {app.type === 'oauth' && (
                              <GlobeAltIcon className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {app.description}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(app.id);
                          }}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`${favorites.includes(app.id) ? 'Remove from' : 'Add to'} favorites`}
                        >
                          <StarIcon
                            className={`h-4 w-4 ${favorites.includes(app.id) ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
                          />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{apps.length} applications available</span>
                {showAdminOptions && (
                  <Link
                    to="/admin/apps"
                    className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Manage Apps
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

export default EnhancedAppSwitcher;
