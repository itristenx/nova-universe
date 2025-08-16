import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface Monitor {
  id: string;
  name: string;
  status: 'up' | 'down';
  uptime: number;
  responseTime?: number;
  lastHeartbeat?: string;
  type: string;
  tags?: string[];
}

interface Incident {
  id: string;
  title: string;
  content: string;
  style: 'info' | 'warning' | 'danger' | 'primary';
  created_at: string;
  pin?: boolean;
}

interface Maintenance {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'completed';
}

interface StatusPageData {
  id: string;
  title: string;
  description: string;
  theme: 'light' | 'dark';
  icon?: string;
  footerText?: string;
  showPoweredBy: boolean;
  overallStatus: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
  monitors: Monitor[];
  incidents: Incident[];
  maintenance: Maintenance[];
  lastUpdated: string;
}

interface NovaStatusPageProps {
  statusPageSlug: string;
  embedded?: boolean;
  compact?: boolean;
}

const NovaStatusPage: React.FC<NovaStatusPageProps> = ({ 
  statusPageSlug, 
  embedded = false, 
  compact = false 
}) => {
  const [statusData, setStatusData] = useState<StatusPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'subscribing' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchStatusPage();
    
    // Set up real-time updates via WebSocket
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe_status_page', statusPageId: statusPageSlug }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status_page_updated' || data.type === 'heartbeat') {
        fetchStatusPage();
      }
    };

    return () => {
      ws.close();
    };
  }, [statusPageSlug]);

  const fetchStatusPage = async () => {
    try {
      const response = await fetch(`/api/v1/status-pages/public/${statusPageSlug}?format=json`); // TODO-LINT: move to async function
      
      if (!response.ok) {
        throw new Error('Status page not found');
      }

      const data = await response.json(); // TODO-LINT: move to async function
      setStatusData(data.statusPage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status page');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscriptionStatus('subscribing');

    try {
      const response = await fetch(`/api/v1/status-pages/public/${statusPageSlug}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: subscriptionEmail, 
          types: ['incidents', 'maintenance'] 
        })
      }); // TODO-LINT: move to async function

      const result = await response.json(); // TODO-LINT: move to async function
      
      if (result.success) {
        setSubscriptionStatus('success');
        setSubscriptionEmail('');
      } else {
        setSubscriptionStatus('error');
      }
    } catch (error) {
      setSubscriptionStatus('error');
    }

    setTimeout(() => setSubscriptionStatus('idle'), 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'degraded_performance':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'partial_outage':
        return <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />;
      case 'major_outage':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ServerIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded_performance':
        return 'bg-yellow-500';
      case 'partial_outage':
        return 'bg-orange-500';
      case 'major_outage':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded_performance':
        return 'Degraded Performance';
      case 'partial_outage':
        return 'Partial System Outage';
      case 'major_outage':
        return 'Major System Outage';
      default:
        return 'System Status Unknown';
    }
  };

  const getIncidentStyle = (style: string) => {
    switch (style) {
      case 'danger':
        return 'border-l-red-500 bg-red-50 text-red-900';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 text-yellow-900';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 text-blue-900';
      case 'primary':
        return 'border-l-purple-500 bg-purple-50 text-purple-900';
      default:
        return 'border-l-gray-500 bg-gray-50 text-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Status Page</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!statusData) {
    return null;
  }

  const isDark = statusData.theme === 'dark';

  if (embedded) {
    return (
      <div className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className={`px-4 py-3 ${getStatusColor(statusData.overallStatus)} text-white text-center font-medium text-sm`}>
          {getStatusMessage(statusData.overallStatus)}
        </div>
        
        <div className="p-4">
          {statusData.monitors.slice(0, compact ? 3 : 8).map((monitor) => (
            <div key={monitor.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
              <span className="text-sm font-medium">{monitor.name}</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${monitor.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {monitor.status === 'up' ? 'Up' : 'Down'}
                </span>
              </div>
            </div>
          ))}
          
          {statusData.monitors.length > (compact ? 3 : 8) && (
            <div className="text-center py-2 text-xs text-gray-500">
              +{statusData.monitors.length - (compact ? 3 : 8)} more services
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center mb-8 p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          {statusData.icon && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
              <img src={statusData.icon} alt="Service Icon" className="w-full h-full object-cover" />
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-4">{statusData.title}</h1>
          {statusData.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300">{statusData.description}</p>
          )}
        </motion.div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-8 p-6 rounded-2xl text-center ${getStatusColor(statusData.overallStatus)} text-white shadow-lg`}
        >
          <div className="flex items-center justify-center space-x-3 mb-2">
            {getStatusIcon(statusData.overallStatus)}
            <span className="text-2xl font-bold">{getStatusMessage(statusData.overallStatus)}</span>
          </div>
          <p className="text-sm opacity-90">Last updated: {new Date(statusData.lastUpdated).toLocaleString()}</p>
        </motion.div>

        {/* Active Incidents */}
        <AnimatePresence>
          {statusData.incidents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <BellIcon className="w-6 h-6 text-red-500" />
                  <h2 className="text-xl font-semibold">Active Incidents</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {statusData.incidents.map((incident) => (
                  <motion.div
                    key={incident.id}
                    layout
                    className={`p-4 border-l-4 rounded-lg ${getIncidentStyle(incident.style)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-2">{incident.title}</h3>
                        <p className="text-sm">{incident.content}</p>
                        <p className="text-xs mt-2 opacity-75">
                          {new Date(incident.created_at).toLocaleString()}
                        </p>
                      </div>
                      {incident.pin && (
                        <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          PINNED
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scheduled Maintenance */}
        <AnimatePresence>
          {statusData.maintenance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <WrenchScrewdriverIcon className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Scheduled Maintenance</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {statusData.maintenance.map((maintenance) => (
                  <motion.div
                    key={maintenance.id}
                    layout
                    className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 rounded-lg"
                  >
                    <h3 className="font-semibold mb-2">{maintenance.title}</h3>
                    <p className="text-sm mb-2">{maintenance.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span>Start: {new Date(maintenance.start_time).toLocaleString()}</span>
                      <span>End: {new Date(maintenance.end_time).toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        maintenance.status === 'active' ? 'bg-yellow-200 text-yellow-800' :
                        maintenance.status === 'completed' ? 'bg-green-200 text-green-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {maintenance.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <ServerIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Services Status</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {statusData.monitors.map((monitor) => (
                <motion.div
                  key={monitor.id}
                  layout
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${monitor.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <h3 className="font-medium">{monitor.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Type: {monitor.type}</span>
                        {monitor.uptime && <span>Uptime: {monitor.uptime.toFixed(2)}%</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      monitor.status === 'up' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {monitor.status === 'up' ? 'Operational' : 'Down'}
                    </span>
                    {monitor.responseTime && (
                      <div className="text-xs text-gray-500 mt-1">
                        {monitor.responseTime}ms
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Email Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BellIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Get Notified</h2>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Subscribe to receive notifications about incidents and maintenance.
            </p>
            
            <form onSubmit={handleSubscription} className="max-w-md">
              <div className="flex space-x-3">
                <input
                  type="email"
                  value={subscriptionEmail}
                  onChange={(e) => setSubscriptionEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <motion.button
                  type="submit"
                  disabled={subscriptionStatus === 'subscribing'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {subscriptionStatus === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
                </motion.button>
              </div>
              
              {subscriptionStatus === 'success' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-green-600"
                >
                  Subscription successful! Please check your email to confirm.
                </motion.p>
              )}
              
              {subscriptionStatus === 'error' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  Subscription failed. Please try again.
                </motion.p>
              )}
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          {statusData.footerText && (
            <p className="mb-2">{statusData.footerText}</p>
          )}
          {statusData.showPoweredBy && (
            <p>Powered by Nova Universe</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovaStatusPage;
