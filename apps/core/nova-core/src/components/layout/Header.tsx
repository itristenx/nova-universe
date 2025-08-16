import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, BellIcon, ChevronDownIcon, ServerIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useApiHealth } from '@/hooks/useApiHealth';
import { useConnectionNotifications } from '@/hooks/useConnectionNotifications';
import { useToastStore } from '@/stores/toast';
import { ServerConnectionModal } from '@/components/ServerConnectionModal';
import { WebSocketStatus } from '@/components/WebSocketStatus';
import { api } from '@/lib/api';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { isConnected } = useApiHealth();
  useConnectionNotifications(); // Enable real-time connection notifications
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<
    'open' | 'closed' | 'meeting' | 'brb' | 'lunch' | 'unavailable'
  >('open');
  const [loading, setLoading] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load current status on mount and set up periodic updates
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const config = await api.getStatusConfig();
        setCurrentStatus(config.currentStatus || (config.enabled ? 'open' : 'closed'));
      } catch (error) {
        console.error('Failed to load status:', error);
      }
    };

    // Load status immediately
    loadStatus();

    // Set up periodic status updates every 30 seconds
    const statusInterval = setInterval(loadStatus, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(statusInterval);
  }, []);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (
    status: 'open' | 'closed' | 'meeting' | 'brb' | 'lunch' | 'unavailable',
  ) => {
    try {
      setLoading(true);

      // Get current config to preserve existing settings
      const currentConfig = await api.getStatusConfig();

      await api.updateStatusConfig({
        ...currentConfig,
        enabled: status === 'open',
        currentStatus: status,
        openMessage: currentConfig.openMessage || 'Help Desk is Open',
        closedMessage: currentConfig.closedMessage || 'Help Desk is Closed',
        meetingMessage: currentConfig.meetingMessage || 'In a Meeting - Back Soon',
        brbMessage: currentConfig.brbMessage || 'Be Right Back',
        lunchMessage: currentConfig.lunchMessage || 'Out to Lunch - Back in 1 Hour',
        unavailableMessage: currentConfig.unavailableMessage || 'Status Unavailable',
      });

      setCurrentStatus(status);
      setIsDropdownOpen(false);

      addToast({
        type: 'success',
        title: 'Success',
        description: `Indicator status updated to ${status}`,
      });

      // Trigger a reload of the status after a short delay
      setTimeout(async () => {
        try {
          const updatedConfig = await api.getStatusConfig();
          setCurrentStatus(
            updatedConfig.currentStatus || (updatedConfig.enabled ? 'open' : 'closed'),
          );
        } catch (error) {
          console.error('Failed to reload status:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to update status:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update indicator status',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageKiosks = () => {
    setIsDropdownOpen(false);
    navigate('/kiosks');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'meeting':
        return 'bg-purple-500';
      case 'brb':
        return 'bg-yellow-500';
      case 'lunch':
        return 'bg-orange-500';
      case 'unavailable':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button
            type="button"
            className="focus:ring-primary-500 mr-2 -ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:ring-2 focus:outline-none focus:ring-inset lg:hidden dark:text-gray-400 dark:hover:text-gray-100"
            onClick={onToggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* WebSocket Status */}
          <WebSocketStatus />

          {/* Indicator Status Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading}
              className="flex items-center space-x-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 transition-colors duration-200 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-haspopup="menu"
              aria-controls="indicator-status-menu"
            >
              <div className={`h-2 w-2 rounded-full ${getStatusColor(currentStatus)}`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Indicator Status
              </span>
              <ChevronDownIcon
                className={`h-3 w-3 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="indicator-status-menu"
                role="menu"
                aria-label="Indicator status"
                className="ring-opacity-5 absolute right-0 z-50 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black dark:bg-gray-800 dark:ring-gray-600"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleStatusChange('open')}
                    disabled={loading}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700 ${
                      currentStatus === 'open'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    role="menuitem"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('closed')}
                    disabled={loading}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700 ${
                      currentStatus === 'closed'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    role="menuitem"
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Closed</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('meeting')}
                    disabled={loading}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700 ${
                      currentStatus === 'meeting'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    role="menuitem"
                  >
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>In a Meeting</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('brb')}
                    disabled={loading}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700 ${
                      currentStatus === 'brb'
                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    role="menuitem"
                  >
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>Be Right Back</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('lunch')}
                    disabled={loading}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700 ${
                      currentStatus === 'lunch'
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    role="menuitem"
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Out to Lunch</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('unavailable')}
                    disabled={loading}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700 ${
                      currentStatus === 'unavailable'
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    role="menuitem"
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Status Unavailable</span>
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-600"></div>
                  <button
                    onClick={handleManageKiosks}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    Manage Individual Kiosks
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* API Status Indicator */}
          <button
            onClick={() => setShowServerModal(true)}
            className="flex items-center space-x-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            title={`Server ${isConnected ? 'Connected' : 'Offline'} - Click to configure`}
          >
            <div className="relative">
              <ServerIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div
                className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
            </div>
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="focus:ring-primary-500 relative rounded-md p-2 text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {/* Notification badge */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800" />
          </button>
        </div>
      </div>

      {/* Server Connection Modal */}
      <ServerConnectionModal isOpen={showServerModal} onClose={() => setShowServerModal(false)} />
    </header>
  );
};
