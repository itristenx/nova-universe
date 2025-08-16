import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { 
  ServerIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useApiHealth } from '@/hooks/useApiHealth';
import { useToastStore } from '@/stores/toast';

interface ServerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServerInfo {
  url: string;
  status: 'connected' | 'disconnected' | 'checking';
  version?: string;
  uptime?: string;
  lastChecked?: string;
}

export const ServerConnectionModal: React.FC<ServerConnectionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [serverUrl, setServerUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    url: '',
    status: 'checking'
  });
  const [testing, setTesting] = useState(false);
  const { isConnected } = useApiHealth();
  const { addToast } = useToastStore();

  useEffect(() => {
    // Load current server URL from environment or localStorage
    const currentUrl = localStorage.getItem('api_server_url') || 
                       import.meta.env.VITE_API_URL || 
                       (import.meta.env.DEV ? 'http://localhost:3000' : '');
    setServerUrl(currentUrl);
    setSavedUrl(currentUrl);
    
    setServerInfo({
      url: currentUrl,
      status: isConnected ? 'connected' : 'disconnected',
      lastChecked: new Date().toLocaleTimeString()
    });
  }, [isConnected]);

  const testConnection = async (url: string = serverUrl) => {
    setTesting(true);
    setServerInfo(prev => ({ ...prev, status: 'checking' }));

    try {
      // Test the connection by making a simple request
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        setServerInfo({
          url,
          status: 'connected',
          version: data.version || 'Unknown',
          uptime: data.uptime || 'Unknown',
          lastChecked: new Date().toLocaleTimeString()
        });
        
        addToast({
          type: 'success',
          title: 'Connection Successful',
          description: `Successfully connected to server at ${url}`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setServerInfo({
        url,
        status: 'disconnected',
        lastChecked: new Date().toLocaleTimeString()
      });
      
      addToast({
        type: 'error',
        title: 'Connection Failed',
        description: `Unable to connect to server: ${error.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const saveServerUrl = () => {
    // Save to localStorage
    localStorage.setItem('api_server_url', serverUrl);
    setSavedUrl(serverUrl);
    
    addToast({
      type: 'info',
      title: 'Server URL Updated',
      description: 'Server URL has been saved. Please refresh the page to apply changes.',
    });
    
    // Test the new connection
    testConnection(serverUrl);
  };

  const resetToDefault = () => {
    const defaultUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');
    setServerUrl(defaultUrl);
    localStorage.removeItem('api_server_url');
    testConnection(defaultUrl);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 dark:text-green-400';
      case 'disconnected':
        return 'text-red-600 dark:text-red-400';
      case 'checking':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'disconnected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'checking':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-spin" />;
      default:
        return <ServerIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Server Connection Settings"
      size="lg"
    >
      <div className="space-y-6">
        {/* Current Status */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <ServerIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Server Status
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(serverInfo.status)}
                <span className={`text-sm font-medium ${getStatusColor(serverInfo.status)}`}>
                  {serverInfo.status === 'connected' && 'Connected'}
                  {serverInfo.status === 'disconnected' && 'Disconnected'}
                  {serverInfo.status === 'checking' && 'Checking...'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last checked: {serverInfo.lastChecked || 'Never'}
              </p>
            </div>
            
            {serverInfo.status === 'connected' && (
              <div className="space-y-1">
                {serverInfo.version && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Version: {serverInfo.version}
                  </p>
                )}
                {serverInfo.uptime && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Uptime: {serverInfo.uptime}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Server URL Configuration */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Server Configuration
            </h3>
          </div>
          
          <Input
            label="Server URL"
            type="url"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:3000"
            helperText="Enter the full URL of your Nova Universe API server"
          />
          
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              onClick={() => testConnection()}
              isLoading={testing}
              disabled={!serverUrl.trim()}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={saveServerUrl}
              disabled={serverUrl === savedUrl || !serverUrl.trim()}
            >
              Save URL
            </Button>
            
            <Button
              variant="default"
              onClick={resetToDefault}
            >
              Reset to Default
            </Button>
          </div>
        </div>

        {/* Connection Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Connection Information
          </h4>
          <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <p>• The server URL will be saved in your browser's local storage</p>
            <p>• Changes require a page refresh to take effect</p>
            <p>• Default URL is configured via environment variables</p>
            <p>• Test connection before saving to verify server availability</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
