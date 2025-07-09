import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, BellIcon, ChevronDownIcon, ServerIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useApiHealth } from '@/hooks/useApiHealth';
import { useConnectionNotifications } from '@/hooks/useConnectionNotifications';
import { useToastStore } from '@/stores/toast';
import { ServerConnectionModal } from '@/components/ServerConnectionModal';
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
  const [currentStatus, setCurrentStatus] = useState<'open' | 'closed' | 'meeting' | 'brb' | 'lunch' | 'unavailable'>('open');
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

  const handleStatusChange = async (status: 'open' | 'closed' | 'meeting' | 'brb' | 'lunch' | 'unavailable') => {
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
        unavailableMessage: currentConfig.unavailableMessage || 'Status Unavailable'
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
          setCurrentStatus(updatedConfig.currentStatus || (updatedConfig.enabled ? 'open' : 'closed'));
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
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden -ml-2 mr-2 h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
          {/* Indicator Status Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 transition-colors duration-200 disabled:opacity-50"
            >
              <div className={`h-2 w-2 rounded-full ${getStatusColor(currentStatus)}`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Indicator Status
              </span>
              <ChevronDownIcon className={`h-3 w-3 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleStatusChange('open')}
                    disabled={loading}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${
                      currentStatus === 'open' ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('closed')}
                    disabled={loading}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${
                      currentStatus === 'closed' ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Closed</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('meeting')}
                    disabled={loading}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${
                      currentStatus === 'meeting' ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>In a Meeting</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('brb')}
                    disabled={loading}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${
                      currentStatus === 'brb' ? 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>Be Right Back</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('lunch')}
                    disabled={loading}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${
                      currentStatus === 'lunch' ? 'bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Out to Lunch</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('unavailable')}
                    disabled={loading}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${
                      currentStatus === 'unavailable' ? 'bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Status Unavailable</span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                  <button
                    onClick={handleManageKiosks}
                    disabled={loading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
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
            className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
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
            className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {/* Notification badge */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800" />
          </button>
        </div>
      </div>
      
      {/* Server Connection Modal */}
      <ServerConnectionModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </header>
  );
};
