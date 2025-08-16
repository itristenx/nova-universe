import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import {
  ServerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useApiHealth } from '@/hooks/useApiHealth';
import { useToastStore } from '@/stores/toast';
export const ServerConnectionModal = ({ isOpen, onClose }) => {
  const [serverUrl, setServerUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [serverInfo, setServerInfo] = useState({
    url: '',
    status: 'checking',
  });
  const [testing, setTesting] = useState(false);
  const { isConnected } = useApiHealth();
  const { addToast } = useToastStore();
  useEffect(() => {
    // Load current server URL from environment or localStorage
    const currentUrl =
      localStorage.getItem('api_server_url') ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:3000';
    setServerUrl(currentUrl);
    setSavedUrl(currentUrl);
    setServerInfo({
      url: currentUrl,
      status: isConnected ? 'connected' : 'disconnected',
      lastChecked: new Date().toLocaleTimeString(),
    });
  }, [isConnected]);
  const testConnection = async (url = serverUrl) => {
    setTesting(true);
    setServerInfo((prev) => ({ ...prev, status: 'checking' }));
    try {
      // Test the connection by making a simple request
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      if (response.ok) {
        const data = await response.json();
        setServerInfo({
          url,
          status: 'connected',
          version: data.version || 'Unknown',
          uptime: data.uptime || 'Unknown',
          lastChecked: new Date().toLocaleTimeString(),
        });
        addToast({
          type: 'success',
          title: 'Connection Successful',
          description: `Successfully connected to server at ${url}`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setServerInfo({
        url,
        status: 'disconnected',
        lastChecked: new Date().toLocaleTimeString(),
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
    const defaultUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    setServerUrl(defaultUrl);
    localStorage.removeItem('api_server_url');
    testConnection(defaultUrl);
  };
  const getStatusColor = (status) => {
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
  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return React.createElement(CheckCircleIcon, {
          className: 'h-5 w-5 text-green-600 dark:text-green-400',
        });
      case 'disconnected':
        return React.createElement(ExclamationTriangleIcon, {
          className: 'h-5 w-5 text-red-600 dark:text-red-400',
        });
      case 'checking':
        return React.createElement(ArrowPathIcon, {
          className: 'h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-spin',
        });
      default:
        return React.createElement(ServerIcon, {
          className: 'h-5 w-5 text-gray-600 dark:text-gray-400',
        });
    }
  };
  return React.createElement(
    Modal,
    { isOpen: isOpen, onClose: onClose, title: 'Server Connection Settings', size: 'lg' },
    React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'div',
        { className: 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4' },
        React.createElement(
          'div',
          { className: 'flex items-center space-x-3 mb-3' },
          React.createElement(ServerIcon, {
            className: 'h-6 w-6 text-gray-600 dark:text-gray-400',
          }),
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 dark:text-gray-100' },
            'Server Status',
          ),
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              { className: 'flex items-center space-x-2 mb-2' },
              getStatusIcon(serverInfo.status),
              React.createElement(
                'span',
                { className: `text-sm font-medium ${getStatusColor(serverInfo.status)}` },
                serverInfo.status === 'connected' && 'Connected',
                serverInfo.status === 'disconnected' && 'Disconnected',
                serverInfo.status === 'checking' && 'Checking...',
              ),
            ),
            React.createElement(
              'p',
              { className: 'text-xs text-gray-500 dark:text-gray-400' },
              'Last checked: ',
              serverInfo.lastChecked || 'Never',
            ),
          ),
          serverInfo.status === 'connected' &&
            React.createElement(
              'div',
              { className: 'space-y-1' },
              serverInfo.version &&
                React.createElement(
                  'p',
                  { className: 'text-xs text-gray-600 dark:text-gray-400' },
                  'Version: ',
                  serverInfo.version,
                ),
              serverInfo.uptime &&
                React.createElement(
                  'p',
                  { className: 'text-xs text-gray-600 dark:text-gray-400' },
                  'Uptime: ',
                  serverInfo.uptime,
                ),
            ),
        ),
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'div',
          { className: 'flex items-center space-x-2' },
          React.createElement(Cog6ToothIcon, {
            className: 'h-5 w-5 text-gray-600 dark:text-gray-400',
          }),
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 dark:text-gray-100' },
            'Server Configuration',
          ),
        ),
        React.createElement(Input, {
          label: 'Server URL',
          type: 'url',
          value: serverUrl,
          onChange: (e) => setServerUrl(e.target.value),
          placeholder: 'http://localhost:3000',
          helperText: 'Enter the full URL of your Nova Universe API server',
        }),
        React.createElement(
          'div',
          { className: 'flex items-center space-x-3' },
          React.createElement(
            Button,
            {
              variant: 'primary',
              onClick: () => testConnection(),
              isLoading: testing,
              disabled: !serverUrl.trim(),
            },
            testing ? 'Testing...' : 'Test Connection',
          ),
          React.createElement(
            Button,
            {
              variant: 'secondary',
              onClick: saveServerUrl,
              disabled: serverUrl === savedUrl || !serverUrl.trim(),
            },
            'Save URL',
          ),
          React.createElement(
            Button,
            { variant: 'default', onClick: resetToDefault },
            'Reset to Default',
          ),
        ),
      ),
      React.createElement(
        'div',
        { className: 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4' },
        React.createElement(
          'h4',
          { className: 'text-sm font-medium text-blue-900 dark:text-blue-100 mb-2' },
          'Connection Information',
        ),
        React.createElement(
          'div',
          { className: 'space-y-1 text-xs text-blue-800 dark:text-blue-200' },
          React.createElement(
            'p',
            null,
            "\u2022 The server URL will be saved in your browser's local storage",
          ),
          React.createElement('p', null, '\u2022 Changes require a page refresh to take effect'),
          React.createElement(
            'p',
            null,
            '\u2022 Default URL is configured via environment variables',
          ),
          React.createElement(
            'p',
            null,
            '\u2022 Test connection before saving to verify server availability',
          ),
        ),
      ),
    ),
  );
};
