/**
 * Space Settings Component for Nova Spaces
 * Administrative configuration and management interface
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Users,
  Clock,
  Shield,
  Bell,
  Wifi,
  Monitor,
  Camera,
  Lock,
  Calendar,
  MapPin,
  Thermometer,
  Lightbulb,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Button } from '../../../../../../packages/design-system';
import { Card, CardBody, CardHeader } from '../../../../../../packages/design-system';
import './SpaceSettings.css';

interface SpaceSettingsProps {
  buildingId?: string;
  onSettingsChange?: (settings: any) => void;
  className?: string;
}

interface SpaceConfiguration {
  id: string;
  name: string;
  type: string;
  capacity: number;
  bookingEnabled: boolean;
  autoApproval: boolean;
  maxBookingDuration: number;
  advanceBookingDays: number;
  accessControl: 'public' | 'restricted' | 'private';
  amenities: string[];
  equipmentIds: string[];
  sensors: {
    occupancy: boolean;
    temperature: boolean;
    lighting: boolean;
    airQuality: boolean;
  };
  notifications: {
    bookingConfirmation: boolean;
    capacityAlert: boolean;
    maintenanceReminder: boolean;
  };
}

interface BuildingSettings {
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  holidays: string[];
  defaultBookingDuration: number;
  maxAdvanceBooking: number;
  autoCheckout: boolean;
  guestWifiEnabled: boolean;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  integrations: {
    calendar: boolean;
    email: boolean;
    slack: boolean;
    teams: boolean;
  };
}

export function SpaceSettings({
  buildingId = 'main-building',
  onSettingsChange,
  className,
}: SpaceSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [buildingSettings, setBuildingSettings] = useState<BuildingSettings>({
    workingHours: {
      start: '08:00',
      end: '18:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    holidays: [],
    defaultBookingDuration: 60,
    maxAdvanceBooking: 30,
    autoCheckout: true,
    guestWifiEnabled: true,
    securityLevel: 'enhanced',
    integrations: {
      calendar: true,
      email: true,
      slack: false,
      teams: false,
    },
  });

  const [spaceConfigs, setSpaceConfigs] = useState<SpaceConfiguration[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mock data - would come from API
  useEffect(() => {
    const mockSpaces: SpaceConfiguration[] = [
      {
        id: 'meeting-001',
        name: 'Conference Room A',
        type: 'conference_room',
        capacity: 8,
        bookingEnabled: true,
        autoApproval: true,
        maxBookingDuration: 240,
        advanceBookingDays: 30,
        accessControl: 'public',
        amenities: ['projector', 'whiteboard', 'video_conferencing'],
        equipmentIds: ['proj-001', 'board-001', 'vc-001'],
        sensors: {
          occupancy: true,
          temperature: true,
          lighting: true,
          airQuality: false,
        },
        notifications: {
          bookingConfirmation: true,
          capacityAlert: true,
          maintenanceReminder: true,
        },
      },
      {
        id: 'desk-001',
        name: 'Hot Desk Area',
        type: 'hot_desk',
        capacity: 20,
        bookingEnabled: true,
        autoApproval: false,
        maxBookingDuration: 480,
        advanceBookingDays: 7,
        accessControl: 'restricted',
        amenities: ['monitors', 'desk_phone', 'storage'],
        equipmentIds: ['mon-001', 'phone-001'],
        sensors: {
          occupancy: true,
          temperature: false,
          lighting: false,
          airQuality: true,
        },
        notifications: {
          bookingConfirmation: true,
          capacityAlert: false,
          maintenanceReminder: false,
        },
      },
    ];
    setSpaceConfigs(mockSpaces);
  }, []);

  const handleBuildingSettingsChange = (key: string, value: any) => {
    setBuildingSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSpaceConfigChange = (spaceId: string, key: string, value: any) => {
    setSpaceConfigs((prev) =>
      prev.map((space) => (space.id === spaceId ? { ...space, [key]: value } : space)),
    );
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setHasChanges(false);
      onSettingsChange?.({ building: buildingSettings, spaces: spaceConfigs });
    } catch (_error) {
      console.error('Failed to save settings:', error);
    }
    setIsLoading(false);
  };

  const selectedSpaceConfig = selectedSpace
    ? spaceConfigs.find((s) => s.id === selectedSpace)
    : null;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'access', label: 'Access Control', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Wifi },
    { id: 'spaces', label: 'Space Configuration', icon: Building },
  ];

  return (
    <div className={`space-settings ${className || ''}`}>
      {/* Header */}
      <div className="settings-header">
        <div className="header-info">
          <h2>Space Settings</h2>
          <p>Configure building and space management settings</p>
        </div>
        <div className="header-actions">
          {hasChanges && (
            <div className="changes-indicator">
              <AlertTriangle className="icon-sm" />
              Unsaved changes
            </div>
          )}
          <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? <EyeOff className="icon-sm" /> : <Eye className="icon-sm" />}
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <RefreshCw className="icon-sm animate-spin" />
            ) : (
              <Save className="icon-sm" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="icon-sm" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <Card>
              <CardHeader>
                <h3>Building Hours & Operations</h3>
              </CardHeader>
              <CardBody>
                <div className="settings-grid">
                  <div className="setting-group">
                    <label htmlFor="start-time">Start Time</label>
                    <input
                      id="start-time"
                      type="time"
                      value={buildingSettings.workingHours.start}
                      onChange={(e) =>
                        handleBuildingSettingsChange('workingHours', {
                          ...buildingSettings.workingHours,
                          start: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="setting-group">
                    <label htmlFor="end-time">End Time</label>
                    <input
                      id="end-time"
                      type="time"
                      value={buildingSettings.workingHours.end}
                      onChange={(e) =>
                        handleBuildingSettingsChange('workingHours', {
                          ...buildingSettings.workingHours,
                          end: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="setting-group">
                    <label htmlFor="default-duration">Default Booking Duration (minutes)</label>
                    <input
                      id="default-duration"
                      type="number"
                      value={buildingSettings.defaultBookingDuration}
                      onChange={(e) =>
                        handleBuildingSettingsChange(
                          'defaultBookingDuration',
                          parseInt(e.target.value),
                        )
                      }
                      min="15"
                      max="480"
                      step="15"
                    />
                  </div>

                  <div className="setting-group">
                    <label htmlFor="advance-booking">Max Advance Booking (days)</label>
                    <input
                      id="advance-booking"
                      type="number"
                      value={buildingSettings.maxAdvanceBooking}
                      onChange={(e) =>
                        handleBuildingSettingsChange('maxAdvanceBooking', parseInt(e.target.value))
                      }
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="setting-group">
                  <label>Working Days</label>
                  <div className="checkbox-group" role="group" aria-labelledby="working-days-label">
                    <span id="working-days-label" className="sr-only">
                      Select working days
                    </span>
                    {[
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                      'saturday',
                      'sunday',
                    ].map((day) => (
                      <label key={day} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={buildingSettings.workingHours.days.includes(day)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...buildingSettings.workingHours.days, day]
                              : buildingSettings.workingHours.days.filter((d) => d !== day);
                            handleBuildingSettingsChange('workingHours', {
                              ...buildingSettings.workingHours,
                              days,
                            });
                          }}
                          aria-describedby={`${day}-description`}
                        />
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                        <span id={`${day}-description`} className="sr-only">
                          Toggle {day} as working day
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={buildingSettings.autoCheckout}
                      onChange={(e) =>
                        handleBuildingSettingsChange('autoCheckout', e.target.checked)
                      }
                      aria-describedby="auto-checkout-description"
                    />
                    <span className="toggle-slider"></span>
                    Auto-checkout at end of booking
                    <span id="auto-checkout-description" className="sr-only">
                      Automatically check out users when their booking ends
                    </span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={buildingSettings.guestWifiEnabled}
                      onChange={(e) =>
                        handleBuildingSettingsChange('guestWifiEnabled', e.target.checked)
                      }
                      aria-describedby="guest-wifi-description"
                    />
                    <span className="toggle-slider"></span>
                    Guest WiFi Access
                    <span id="guest-wifi-description" className="sr-only">
                      Enable guest WiFi access for visitors
                    </span>
                  </label>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="settings-section">
            <Card>
              <CardHeader>
                <h3>Security & Access Control</h3>
              </CardHeader>
              <CardBody>
                <div className="setting-group">
                  <label htmlFor="security-level">Security Level</label>
                  <select
                    id="security-level"
                    value={buildingSettings.securityLevel}
                    onChange={(e) => handleBuildingSettingsChange('securityLevel', e.target.value)}
                  >
                    <option value="basic">Basic - Badge access only</option>
                    <option value="enhanced">Enhanced - Badge + photo verification</option>
                    <option value="maximum">Maximum - Multi-factor authentication</option>
                  </select>
                </div>

                {showAdvanced && (
                  <div className="advanced-settings">
                    <h4>Advanced Security Options</h4>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked
                          aria-describedby="host-approval-description"
                        />
                        <span className="toggle-slider"></span>
                        Require host approval for all visitors
                        <span id="host-approval-description" className="sr-only">
                          All visitor access must be approved by host
                        </span>
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input type="checkbox" aria-describedby="facial-recognition-description" />
                        <span className="toggle-slider"></span>
                        Enable facial recognition
                        <span id="facial-recognition-description" className="sr-only">
                          Use facial recognition for visitor identification
                        </span>
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked
                          aria-describedby="access-logging-description"
                        />
                        <span className="toggle-slider"></span>
                        Log all space access events
                        <span id="access-logging-description" className="sr-only">
                          Record all space access activities for security audit
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-section">
            <Card>
              <CardHeader>
                <h3>Notification Settings</h3>
              </CardHeader>
              <CardBody>
                <div className="notification-categories">
                  <div className="category">
                    <h4>Booking Notifications</h4>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked
                          aria-describedby="booking-confirmation-description"
                        />
                        <span className="toggle-slider"></span>
                        Send booking confirmations
                        <span id="booking-confirmation-description" className="sr-only">
                          Send email confirmation when booking is made
                        </span>
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked
                          aria-describedby="reminder-notifications-description"
                        />
                        <span className="toggle-slider"></span>
                        Send reminder notifications
                        <span id="reminder-notifications-description" className="sr-only">
                          Send reminder before booking starts
                        </span>
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          aria-describedby="cancellation-notifications-description"
                        />
                        <span className="toggle-slider"></span>
                        Send cancellation notifications
                        <span id="cancellation-notifications-description" className="sr-only">
                          Send notification when booking is cancelled
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="category">
                    <h4>Space Alerts</h4>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked
                          aria-describedby="capacity-alerts-description"
                        />
                        <span className="toggle-slider"></span>
                        Capacity exceeded alerts
                        <span id="capacity-alerts-description" className="sr-only">
                          Alert when space capacity is exceeded
                        </span>
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input type="checkbox" aria-describedby="equipment-alerts-description" />
                        <span className="toggle-slider"></span>
                        Equipment malfunction alerts
                        <span id="equipment-alerts-description" className="sr-only">
                          Alert when equipment malfunctions are detected
                        </span>
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked
                          aria-describedby="maintenance-alerts-description"
                        />
                        <span className="toggle-slider"></span>
                        Maintenance due alerts
                        <span id="maintenance-alerts-description" className="sr-only">
                          Alert when maintenance is due
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="category">
                    <h4>System Notifications</h4>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked
                          aria-describedby="daily-reports-description"
                        />
                        <span className="toggle-slider"></span>
                        Daily usage reports
                        <span id="daily-reports-description" className="sr-only">
                          Receive daily usage statistics
                        </span>
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="toggle-label">
                        <input type="checkbox" aria-describedby="weekly-analytics-description" />
                        <span className="toggle-slider"></span>
                        Weekly analytics summaries
                        <span id="weekly-analytics-description" className="sr-only">
                          Receive weekly analytics summaries
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="settings-section">
            <Card>
              <CardHeader>
                <h3>Third-party Integrations</h3>
              </CardHeader>
              <CardBody>
                <div className="integration-list">
                  <div className="integration-item">
                    <div className="integration-info">
                      <Calendar className="integration-icon" />
                      <div>
                        <h4>Calendar Integration</h4>
                        <p>Sync bookings with Outlook, Google Calendar</p>
                      </div>
                    </div>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={buildingSettings.integrations.calendar}
                        onChange={(e) =>
                          handleBuildingSettingsChange('integrations', {
                            ...buildingSettings.integrations,
                            calendar: e.target.checked,
                          })
                        }
                        aria-describedby="calendar-integration-description"
                      />
                      <span className="toggle-slider"></span>
                      <span id="calendar-integration-description" className="sr-only">
                        Enable calendar synchronization with external services
                      </span>
                    </label>
                  </div>

                  <div className="integration-item">
                    <div className="integration-info">
                      <Bell className="integration-icon" />
                      <div>
                        <h4>Email Notifications</h4>
                        <p>Send email confirmations and reminders</p>
                      </div>
                    </div>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={buildingSettings.integrations.email}
                        onChange={(e) =>
                          handleBuildingSettingsChange('integrations', {
                            ...buildingSettings.integrations,
                            email: e.target.checked,
                          })
                        }
                        aria-describedby="email-integration-description"
                      />
                      <span className="toggle-slider"></span>
                      <span id="email-integration-description" className="sr-only">
                        Enable email notifications for bookings and alerts
                      </span>
                    </label>
                  </div>

                  <div className="integration-item">
                    <div className="integration-info">
                      <Users className="integration-icon" />
                      <div>
                        <h4>Slack Integration</h4>
                        <p>Send notifications to Slack channels</p>
                      </div>
                    </div>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={buildingSettings.integrations.slack}
                        onChange={(e) =>
                          handleBuildingSettingsChange('integrations', {
                            ...buildingSettings.integrations,
                            slack: e.target.checked,
                          })
                        }
                        aria-describedby="slack-integration-description"
                      />
                      <span className="toggle-slider"></span>
                      <span id="slack-integration-description" className="sr-only">
                        Enable Slack notifications and integrations
                      </span>
                    </label>
                  </div>

                  <div className="integration-item">
                    <div className="integration-info">
                      <Monitor className="integration-icon" />
                      <div>
                        <h4>Microsoft Teams</h4>
                        <p>Create Teams meetings for room bookings</p>
                      </div>
                    </div>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={buildingSettings.integrations.teams}
                        onChange={(e) =>
                          handleBuildingSettingsChange('integrations', {
                            ...buildingSettings.integrations,
                            teams: e.target.checked,
                          })
                        }
                        aria-describedby="teams-integration-description"
                      />
                      <span className="toggle-slider"></span>
                      <span id="teams-integration-description" className="sr-only">
                        Enable Microsoft Teams meeting creation for bookings
                      </span>
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'spaces' && (
          <div className="settings-section">
            <div className="spaces-layout">
              <Card className="spaces-list">
                <CardHeader>
                  <h3>Space Configuration</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="icon-sm" />
                    Add Space
                  </Button>
                </CardHeader>
                <CardBody>
                  {spaceConfigs.map((space) => (
                    <div
                      key={space.id}
                      className={`space-item ${selectedSpace === space.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSpace(space.id)}
                    >
                      <div className="space-info">
                        <h4>{space.name}</h4>
                        <p>
                          {space.type.replace('_', ' ')} • Capacity: {space.capacity}
                        </p>
                      </div>
                      <div className="space-status">
                        {space.bookingEnabled ? (
                          <CheckCircle className="icon-sm text-success" />
                        ) : (
                          <AlertTriangle className="icon-sm text-warning" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {selectedSpaceConfig && (
                <Card className="space-config">
                  <CardHeader>
                    <h3>{selectedSpaceConfig.name} Configuration</h3>
                    <div className="space-actions">
                      <Button size="sm" variant="outline">
                        <Edit3 className="icon-sm" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="icon-sm" />
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="config-sections">
                      <div className="config-section">
                        <h4>Basic Settings</h4>
                        <div className="settings-grid">
                          <div className="setting-group">
                            <label htmlFor="space-capacity">Capacity</label>
                            <input
                              id="space-capacity"
                              type="number"
                              value={selectedSpaceConfig.capacity}
                              onChange={(e) =>
                                handleSpaceConfigChange(
                                  selectedSpaceConfig.id,
                                  'capacity',
                                  parseInt(e.target.value),
                                )
                              }
                              min="1"
                              max="100"
                            />
                          </div>

                          <div className="setting-group">
                            <label htmlFor="max-duration">Max Booking Duration (minutes)</label>
                            <input
                              id="max-duration"
                              type="number"
                              value={selectedSpaceConfig.maxBookingDuration}
                              onChange={(e) =>
                                handleSpaceConfigChange(
                                  selectedSpaceConfig.id,
                                  'maxBookingDuration',
                                  parseInt(e.target.value),
                                )
                              }
                              min="15"
                              max="480"
                              step="15"
                            />
                          </div>

                          <div className="setting-group">
                            <label htmlFor="access-control">Access Control</label>
                            <select
                              id="access-control"
                              value={selectedSpaceConfig.accessControl}
                              onChange={(e) =>
                                handleSpaceConfigChange(
                                  selectedSpaceConfig.id,
                                  'accessControl',
                                  e.target.value,
                                )
                              }
                            >
                              <option value="public">Public</option>
                              <option value="restricted">Restricted</option>
                              <option value="private">Private</option>
                            </select>
                          </div>
                        </div>

                        <div className="setting-group">
                          <label className="toggle-label">
                            <input
                              type="checkbox"
                              checked={selectedSpaceConfig.bookingEnabled}
                              onChange={(e) =>
                                handleSpaceConfigChange(
                                  selectedSpaceConfig.id,
                                  'bookingEnabled',
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="toggle-slider"></span>
                            Enable bookings for this space
                          </label>
                        </div>

                        <div className="setting-group">
                          <label className="toggle-label">
                            <input
                              type="checkbox"
                              checked={selectedSpaceConfig.autoApproval}
                              onChange={(e) =>
                                handleSpaceConfigChange(
                                  selectedSpaceConfig.id,
                                  'autoApproval',
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="toggle-slider"></span>
                            Auto-approve bookings
                          </label>
                        </div>
                      </div>

                      <div className="config-section">
                        <h4>Sensors & Monitoring</h4>
                        <div className="sensor-grid">
                          <label className="sensor-label">
                            <input
                              type="checkbox"
                              checked={selectedSpaceConfig.sensors.occupancy}
                              onChange={(e) =>
                                handleSpaceConfigChange(selectedSpaceConfig.id, 'sensors', {
                                  ...selectedSpaceConfig.sensors,
                                  occupancy: e.target.checked,
                                })
                              }
                            />
                            <Users className="sensor-icon" />
                            Occupancy Sensor
                          </label>

                          <label className="sensor-label">
                            <input
                              type="checkbox"
                              checked={selectedSpaceConfig.sensors.temperature}
                              onChange={(e) =>
                                handleSpaceConfigChange(selectedSpaceConfig.id, 'sensors', {
                                  ...selectedSpaceConfig.sensors,
                                  temperature: e.target.checked,
                                })
                              }
                            />
                            <Thermometer className="sensor-icon" />
                            Temperature Sensor
                          </label>

                          <label className="sensor-label">
                            <input
                              type="checkbox"
                              checked={selectedSpaceConfig.sensors.lighting}
                              onChange={(e) =>
                                handleSpaceConfigChange(selectedSpaceConfig.id, 'sensors', {
                                  ...selectedSpaceConfig.sensors,
                                  lighting: e.target.checked,
                                })
                              }
                            />
                            <Lightbulb className="sensor-icon" />
                            Lighting Control
                          </label>

                          <label className="sensor-label">
                            <input
                              type="checkbox"
                              checked={selectedSpaceConfig.sensors.airQuality}
                              onChange={(e) =>
                                handleSpaceConfigChange(selectedSpaceConfig.id, 'sensors', {
                                  ...selectedSpaceConfig.sensors,
                                  airQuality: e.target.checked,
                                })
                              }
                            />
                            <Wifi className="sensor-icon" />
                            Air Quality Monitor
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
