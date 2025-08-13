/**
 * Nova Universe Kiosk Status Display
 * Phase 3 Implementation - Real-time status display for kiosk health monitoring
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, CardTitle, CardText, CardActions,
  Button, PrimaryButton, OutlineButton, GhostButton,
  Progress, Spinner,
  useTheme
} from '../../packages/design-system';

const statusDisplayStyles = `
.kiosk-status-display {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-background), var(--color-surface));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);
}

.status-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  padding: var(--space-4) var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-lg);
}

.status-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  margin: 0;
}

.status-time {
  font-size: var(--text-lg);
  font-weight: var(--font-mono);
  opacity: 0.9;
}

.status-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--space-6);
  padding: var(--space-6);
  overflow: hidden;
}

.status-section {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  border: 2px solid var(--color-muted)20;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  color: white;
}

.section-icon--system {
  background: linear-gradient(135deg, var(--color-primary), var(--color-info));
}

.section-icon--network {
  background: linear-gradient(135deg, var(--color-success), var(--color-info));
}

.section-icon--usage {
  background: linear-gradient(135deg, var(--color-warning), var(--color-accent));
}

.section-icon--activity {
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.metric-item {
  text-align: center;
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0 0 var(--space-1) 0;
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.progress-item {
  margin-bottom: var(--space-3);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.progress-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-content);
}

.progress-value {
  font-size: var(--text-sm);
  font-weight: var(--font-mono);
  color: var(--color-muted);
}

.activity-list {
  flex: 1;
  overflow-y: auto;
  margin-top: var(--space-2);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-muted)10;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-indicator--success {
  background-color: var(--color-success);
  box-shadow: 0 0 6px var(--color-success)60;
}

.activity-indicator--warning {
  background-color: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning)60;
}

.activity-indicator--error {
  background-color: var(--color-error);
  box-shadow: 0 0 6px var(--color-error)60;
}

.activity-indicator--info {
  background-color: var(--color-info);
  box-shadow: 0 0 6px var(--color-info)60;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-message {
  font-size: var(--text-sm);
  color: var(--color-content);
  margin: 0 0 var(--space-1) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.status-indicator--online {
  background-color: var(--color-success)20;
  color: var(--color-success);
}

.status-indicator--warning {
  background-color: var(--color-warning)20;
  color: var(--color-warning);
}

.status-indicator--error {
  background-color: var(--color-error)20;
  color: var(--color-error);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.network-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.network-item {
  text-align: center;
  padding: var(--space-3);
  background-color: var(--color-muted)05;
  border-radius: var(--radius-md);
}

.network-value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0;
}

.network-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-footer {
  background-color: var(--color-surface);
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--color-muted)20;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.footer-actions {
  display: flex;
  gap: var(--space-2);
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.activity-indicator--success {
  animation: pulse 2s infinite;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .status-main {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .status-main {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }
  
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .network-info {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = statusDisplayStyles;
  document.head.appendChild(styleElement);
}

export default function KioskStatusDisplay() {
  const { colorMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 15,
    memory: 68,
    storage: 45,
    uptime: '7d 14h 32m'
  });
  const [networkMetrics, setNetworkMetrics] = useState({
    status: 'online',
    latency: 12,
    bandwidth: '100 Mbps',
    packets: 1250
  });
  const [usageStats, setUsageStats] = useState({
    todayTickets: 23,
    activeUsers: 3,
    avgSessionTime: '4m 32s',
    successRate: 98.5
  });
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'success',
      message: 'Ticket #NOV-847123 submitted successfully',
      time: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 2,
      type: 'info',
      message: 'User session started from IT Department',
      time: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 3,
      type: 'success',
      message: 'System health check completed',
      time: new Date(Date.now() - 12 * 60 * 1000)
    },
    {
      id: 4,
      type: 'warning',
      message: 'Memory usage above 65% threshold',
      time: new Date(Date.now() - 18 * 60 * 1000)
    },
    {
      id: 5,
      type: 'success',
      message: 'Network connectivity verified',
      time: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      id: 6,
      type: 'info',
      message: 'User session completed - 6m 42s duration',
      time: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const metricsTimer = setInterval(() => {
      // Update system metrics
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 5))
      }));

      // Update network metrics
      setNetworkMetrics(prev => ({
        ...prev,
        latency: Math.max(8, Math.min(50, prev.latency + (Math.random() - 0.5) * 5)),
        packets: prev.packets + Math.floor(Math.random() * 10)
      }));

      // Randomly add new activity
      if (Math.random() < 0.3) {
        const activities = [
          { type: 'success', message: 'Ticket submitted successfully' },
          { type: 'info', message: 'User session started' },
          { type: 'success', message: 'User session completed' },
          { type: 'info', message: 'System maintenance completed' }
        ];
        
        const newActivity = {
          id: Date.now(),
          ...activities[Math.floor(Math.random() * activities.length)],
          time: new Date()
        };

        setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(metricsTimer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatActivityTime = (date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getProgressColor = (value, thresholds = { warning: 70, error: 85 }) => {
    if (value >= thresholds.error) return 'error';
    if (value >= thresholds.warning) return 'warning';
    return 'success';
  };

  const getNetworkStatus = () => {
    if (networkMetrics.latency > 30) return 'warning';
    if (networkMetrics.latency > 50) return 'error';
    return 'online';
  };

  return (
    <div className="kiosk-status-display">
      {/* Header */}
      <div className="status-header">
        <h1 className="status-title">Nova Universe Kiosk - Status Dashboard</h1>
        <div className="status-time">{formatTime(currentTime)}</div>
      </div>

      {/* Main Content */}
      <div className="status-main">
        {/* System Health */}
        <div className="status-section">
          <div className="section-header">
            <div className="section-icon section-icon--system">💻</div>
            <h2 className="section-title">System Health</h2>
          </div>
          
          <div className="metric-grid">
            <div className="metric-item">
              <div className="metric-value">{systemMetrics.cpu}%</div>
              <div className="metric-label">CPU Usage</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{systemMetrics.memory}%</div>
              <div className="metric-label">Memory</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{systemMetrics.storage}%</div>
              <div className="metric-label">Storage</div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">CPU</span>
              <span className="progress-value">{systemMetrics.cpu}%</span>
            </div>
            <Progress 
              value={systemMetrics.cpu} 
              variant={getProgressColor(systemMetrics.cpu)}
            />
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Memory</span>
              <span className="progress-value">{systemMetrics.memory}%</span>
            </div>
            <Progress 
              value={systemMetrics.memory} 
              variant={getProgressColor(systemMetrics.memory)}
            />
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Storage</span>
              <span className="progress-value">{systemMetrics.storage}%</span>
            </div>
            <Progress 
              value={systemMetrics.storage} 
              variant={getProgressColor(systemMetrics.storage, { warning: 80, error: 90 })}
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            <div className={`status-indicator status-indicator--${systemMetrics.cpu < 80 && systemMetrics.memory < 80 ? 'online' : 'warning'}`}>
              <span className="status-dot"></span>
              System Running {systemMetrics.cpu < 80 && systemMetrics.memory < 80 ? 'Normally' : 'Under Load'}
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="status-section">
          <div className="section-header">
            <div className="section-icon section-icon--network">🌐</div>
            <h2 className="section-title">Network Status</h2>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <div className={`status-indicator status-indicator--${getNetworkStatus()}`}>
              <span className="status-dot"></span>
              {getNetworkStatus() === 'online' ? 'Connected' : 
               getNetworkStatus() === 'warning' ? 'Slow Connection' : 'Connection Issues'}
            </div>
          </div>

          <div className="network-info">
            <div className="network-item">
              <div className="network-value">{networkMetrics.latency}ms</div>
              <div className="network-label">Latency</div>
            </div>
            <div className="network-item">
              <div className="network-value">{networkMetrics.bandwidth}</div>
              <div className="network-label">Bandwidth</div>
            </div>
            <div className="network-item">
              <div className="network-value">{networkMetrics.packets}</div>
              <div className="network-label">Packets Sent</div>
            </div>
            <div className="network-item">
              <div className="network-value">99.9%</div>
              <div className="network-label">Uptime</div>
            </div>
          </div>

          <div className="progress-item" style={{ marginTop: 'var(--space-4)' }}>
            <div className="progress-header">
              <span className="progress-label">Signal Strength</span>
              <span className="progress-value">Excellent</span>
            </div>
            <Progress value={95} variant="success" />
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="status-section">
          <div className="section-header">
            <div className="section-icon section-icon--usage">📊</div>
            <h2 className="section-title">Usage Statistics</h2>
          </div>

          <div className="metric-grid">
            <div className="metric-item">
              <div className="metric-value">{usageStats.todayTickets}</div>
              <div className="metric-label">Today's Tickets</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{usageStats.activeUsers}</div>
              <div className="metric-label">Active Users</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{usageStats.avgSessionTime}</div>
              <div className="metric-label">Avg Session</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{usageStats.successRate}%</div>
              <div className="metric-label">Success Rate</div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Daily Capacity</span>
              <span className="progress-value">{Math.round(usageStats.todayTickets / 50 * 100)}%</span>
            </div>
            <Progress value={usageStats.todayTickets / 50 * 100} variant="info" />
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Success Rate</span>
              <span className="progress-value">{usageStats.successRate}%</span>
            </div>
            <Progress value={usageStats.successRate} variant="success" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="status-section">
          <div className="section-header">
            <div className="section-icon section-icon--activity">📋</div>
            <h2 className="section-title">Recent Activity</h2>
          </div>

          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-indicator activity-indicator--${activity.type}`}></div>
                <div className="activity-content">
                  <div className="activity-message">{activity.message}</div>
                  <div className="activity-time">{formatActivityTime(activity.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="status-footer">
        <div className="footer-info">
          Kiosk ID: NOVA-KIOSK-001 • Uptime: {systemMetrics.uptime} • Version: 2.1.4
        </div>
        <div className="footer-actions">
          <GhostButton size="sm">Refresh</GhostButton>
          <GhostButton size="sm">Export Logs</GhostButton>
          <OutlineButton size="sm">Exit Status</OutlineButton>
        </div>
      </div>
    </div>
  );
}
