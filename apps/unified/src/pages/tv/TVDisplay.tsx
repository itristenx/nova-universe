import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Monitor, Wifi, WifiOff, Settings, RotateCcw } from 'lucide-react';
import { novaTVService, Dashboard } from '../../services/nova-tv';

interface TVDisplayProps {
  dashboardId?: string;
}

const TVDisplay: React.FC<TVDisplayProps> = ({ dashboardId: propDashboardId }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get dashboard ID from props or URL params
  const dashboardId = propDashboardId || searchParams.get('dashboard');
  const deviceId = searchParams.get('device');
  const token = searchParams.get('token');

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (dashboardId) {
      loadDashboard();
      
      // Set up auto-refresh
      const refreshInterval = setInterval(() => {
        loadDashboard(false); // Silent refresh
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    } else {
      // No dashboard ID - redirect to activation
      navigate('/tv/activate');
    }
  }, [dashboardId, navigate]);

  const loadDashboard = async (showLoading = true) => {
    if (!dashboardId) return;
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const data = await novaTVService.getDashboard(dashboardId);
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard content');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleActivate = () => {
    navigate('/tv/activate');
  };

  const renderContent = () => {
    if (!dashboard) return null;

    // Render dashboard content blocks
    return (
      <div className="grid grid-cols-2 gap-4 h-full">
        {dashboard.content?.map((item, index) => (
          <div 
            key={item.id || index}
            className="bg-white rounded-lg shadow-sm p-6 flex flex-col"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {item.title}
            </h3>
            
            <div className="flex-1 flex items-center justify-center">
              {/* Render different content types */}
              {item.contentType === 'text' && (
                <div className="text-center">
                  <p className="text-gray-700">{item.contentData?.content || 'No content'}</p>
                </div>
              )}
              
              {item.contentType === 'metrics' && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.floor(Math.random() * 100)} {/* Mock metric value */}
                  </div>
                  <p className="text-gray-600">{item.contentData?.metricType || 'Metric'}</p>
                </div>
              )}
              
              {item.contentType === 'clock' && (
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
                    {new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: item.contentData?.format === '12hour' 
                    })}
                  </div>
                  {item.contentData?.showDate && (
                    <div className="text-xl text-gray-600">
                      {new Date().toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
              
              {item.contentType === 'announcements' && (
                <div className="w-full">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-blue-800">Welcome to Nova TV!</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                      <p className="text-green-800">System update completed successfully</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!['text', 'metrics', 'clock', 'announcements'].includes(item.contentType) && (
                <div className="text-center text-gray-500">
                  <Monitor className="w-12 h-12 mx-auto mb-2" />
                  <p>Content type: {item.contentType}</p>
                </div>
              )}
            </div>
          </div>
        )) || (
          <div className="col-span-2 flex items-center justify-center h-full">
            <div className="text-center">
              <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Content Available</h3>
              <p className="text-gray-600">This dashboard doesn't have any content configured yet.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Monitor className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => loadDashboard()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retry
            </button>
            <button
              onClick={handleActivate}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Settings className="w-5 h-5" />
              Reconfigure
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {dashboard?.name || 'Nova TV Display'}
              </span>
            </div>
            
            {dashboard?.department && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {dashboard.department}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Online status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Last updated */}
            <span className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>

            {/* Settings button */}
            <button
              onClick={handleActivate}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 h-[calc(100vh-4rem)]">
        {renderContent()}
      </div>
    </div>
  );
};

export default TVDisplay;
