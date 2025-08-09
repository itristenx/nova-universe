/**
 * Nova Universe Admin Dashboard Interface
 * Phase 3 Implementation - Real admin dashboard using design system
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, CardTitle, CardText, CardActions,
  Button, PrimaryButton, OutlineButton,
  Progress, Spinner,
  useTheme
} from '../../packages/design-system';

// Import CSS for design system
import '../../packages/design-system/css-variables.css';

const dashboardStyles = `
.admin-dashboard {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--color-background);
  min-height: 100vh;
}

/* Responsive design for mobile and tablet */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: var(--space-4);
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: var(--space-2);
  }
}

.dashboard-header {
  margin-bottom: var(--space-8);
}

.dashboard-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0 0 var(--space-2) 0;
}

.dashboard-subtitle {
  font-size: var(--text-lg);
  color: var(--color-muted);
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

@media (max-width: 480px) {
  .dashboard-grid {
    gap: var(--space-2);
  }
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.stat-card {
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-1) 0;
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.9;
  margin: 0;
}

.stat-change {
  font-size: var(--text-xs);
  margin-top: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.stat-change--positive {
  color: #34d399;
}

.stat-change--negative {
  color: #fca5a5;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.action-card {
  padding: var(--space-4);
  text-align: center;
  border: 2px dashed var(--color-muted);
  border-radius: var(--radius-lg);
  transition: all var(--duration-200) var(--ease-in-out);
  cursor: pointer;
}

.action-card:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary)10;
}

.action-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-3) auto;
  color: var(--color-primary);
}

.action-title {
  font-weight: var(--font-semibold);
  color: var(--color-content);
  margin: 0 0 var(--space-1) 0;
}

.action-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.recent-activity {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.activity-list {
  space-y: var(--space-4);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-muted)20;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
}

.activity-icon--success {
  background-color: var(--color-success)20;
  color: var(--color-success);
}

.activity-icon--warning {
  background-color: var(--color-warning)20;
  color: var(--color-warning);
}

.activity-icon--error {
  background-color: var(--color-error)20;
  color: var(--color-error);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: var(--font-medium);
  color: var(--color-content);
  margin: 0 0 var(--space-1) 0;
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin: 0;
}

.system-health {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.health-metric {
  padding: var(--space-4);
  background-color: var(--color-background);
  border: 1px solid var(--color-muted)20;
  border-radius: var(--radius-lg);
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.health-title {
  font-weight: var(--font-medium);
  color: var(--color-content);
  margin: 0;
}

.health-status {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-weight: var(--font-medium);
}

.health-status--good {
  background-color: var(--color-success)20;
  color: var(--color-success);
}

.health-status--warning {
  background-color: var(--color-warning)20;
  color: var(--color-warning);
}

.health-status--critical {
  background-color: var(--color-error)20;
  color: var(--color-error);
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: var(--space-4);
  }
  
  .dashboard-grid,
  .dashboard-stats,
  .quick-actions,
  .system-health {
    grid-template-columns: 1fr;
  }
  
  .dashboard-title {
    font-size: var(--text-2xl);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = dashboardStyles;
  document.head.appendChild(styleElement);
}

export default function AdminDashboard() {
  const { colorMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  // Simulate data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalTickets: 2847,
        openTickets: 89,
        resolvedToday: 23,
        avgResponseTime: '3.7h',
        activeKiosks: 9,
        totalUsers: 287
      });
      
      setActivities([
        {
          id: 1,
          type: 'success',
          title: 'Ticket NOV-2024-005 resolved',
          time: '2 minutes ago',
          icon: '✓'
        },
        {
          id: 2,
          type: 'warning',
          title: 'Kiosk offline - Engineering Floor',
          time: '15 minutes ago',
          icon: '⚠'
        },
        {
          id: 3,
          type: 'success',
          title: 'New user registered - Emily Johnson',
          time: '1 hour ago',
          icon: '👤'
        },
        {
          id: 4,
          type: 'error',
          title: 'Integration sync failed - ServiceNow',
          time: '2 hours ago',
          icon: '✗'
        }
      ]);
      
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Loading Dashboard...</h1>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Nova Universe Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your support system.</p>
      </div>

      {/* Key Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3 className="stat-value">{stats.totalTickets.toLocaleString()}</h3>
          <p className="stat-label">Total Tickets</p>
          <div className="stat-change stat-change--positive">
            <span>↗</span> +12% from last month
          </div>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-value">{stats.openTickets}</h3>
          <p className="stat-label">Open Tickets</p>
          <div className="stat-change stat-change--negative">
            <span>↘</span> -8% from yesterday
          </div>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-value">{stats.resolvedToday}</h3>
          <p className="stat-label">Resolved Today</p>
          <div className="stat-change stat-change--positive">
            <span>↗</span> +15% from average
          </div>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-value">{stats.avgResponseTime}</h3>
          <p className="stat-label">Avg Response Time</p>
          <div className="stat-change stat-change--positive">
            <span>↗</span> 22% faster this week
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-icon">📊</div>
              <h4 className="action-title">View Reports</h4>
              <p className="action-description">Generate comprehensive system reports</p>
            </div>
            
            <div className="action-card">
              <div className="action-icon">🎫</div>
              <h4 className="action-title">Manage Tickets</h4>
              <p className="action-description">View and assign support tickets</p>
            </div>
            
            <div className="action-card">
              <div className="action-icon">👥</div>
              <h4 className="action-title">User Management</h4>
              <p className="action-description">Add or modify user accounts</p>
            </div>
            
            <div className="action-card">
              <div className="action-icon">🖥️</div>
              <h4 className="action-title">Kiosk Management</h4>
              <p className="action-description">Monitor and configure kiosks</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <OutlineButton size="sm">View All</OutlineButton>
          </CardHeader>
          <CardBody>
            <div className="activity-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon activity-icon--${activity.type}`}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{activity.title}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
          <CardActions>
            <PrimaryButton size="sm">Refresh</PrimaryButton>
          </CardActions>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="system-health">
              <div className="health-metric">
                <div className="health-header">
                  <h4 className="health-title">Database</h4>
                  <span className="health-status health-status--good">Healthy</span>
                </div>
                <Progress value={95} variant="success" />
              </div>
              
              <div className="health-metric">
                <div className="health-header">
                  <h4 className="health-title">API Performance</h4>
                  <span className="health-status health-status--good">Good</span>
                </div>
                <Progress value={87} variant="info" />
              </div>
              
              <div className="health-metric">
                <div className="health-header">
                  <h4 className="health-title">Disk Usage</h4>
                  <span className="health-status health-status--warning">67%</span>
                </div>
                <Progress value={67} variant="warning" />
              </div>
              
              <div className="health-metric">
                <div className="health-header">
                  <h4 className="health-title">Memory Usage</h4>
                  <span className="health-status health-status--good">54%</span>
                </div>
                <Progress value={54} variant="success" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
