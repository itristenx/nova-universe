'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  CogIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  BellIcon,
  CloudIcon,
  KeyIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface SettingGroup {
  id: string
  title: string
  description: string
  icon: any
  settings: Setting[]
}

interface Setting {
  id: string
  title: string
  description: string
  type: 'text' | 'textarea' | 'select' | 'switch' | 'file' | 'color'
  value: any
  options?: { value: string; label: string }[]
  placeholder?: string
}

const mockSettings: SettingGroup[] = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Basic system configuration and organization details',
    icon: CogIcon,
    settings: [
      {
        id: 'organization_name',
        title: 'Organization Name',
        description: 'The name of your organization displayed throughout the system',
        type: 'text',
        value: 'Nova Universe Corp',
        placeholder: 'Enter organization name'
      },
      {
        id: 'system_url',
        title: 'System URL',
        description: 'The base URL for your Nova Universe installation',
        type: 'text',
        value: 'https://nova.company.com',
        placeholder: 'https://your-domain.com'
      },
      {
        id: 'timezone',
        title: 'Default Timezone',
        description: 'Default timezone for all users and system operations',
        type: 'select',
        value: 'America/New_York',
        options: [
          { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
          { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
          { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
          { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
          { value: 'UTC', label: 'UTC (UTC+0)' },
          { value: 'Europe/London', label: 'GMT (UTC+0)' },
        ]
      },
      {
        id: 'language',
        title: 'Default Language',
        description: 'Default language for the system interface',
        type: 'select',
        value: 'en',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'ja', label: 'Japanese' },
        ]
      }
    ]
  },
  {
    id: 'branding',
    title: 'Branding & Appearance',
    description: 'Customize the look and feel of your Nova Universe',
    icon: PaintBrushIcon,
    settings: [
      {
        id: 'logo_url',
        title: 'Organization Logo',
        description: 'Upload your organization logo (recommended: 200x60px, PNG/SVG)',
        type: 'file',
        value: '/api/uploads/logo.png'
      },
      {
        id: 'favicon_url',
        title: 'Favicon',
        description: 'Upload a favicon for browser tabs (recommended: 32x32px, ICO/PNG)',
        type: 'file',
        value: '/api/uploads/favicon.ico'
      },
      {
        id: 'primary_color',
        title: 'Primary Color',
        description: 'Main brand color used throughout the interface',
        type: 'color',
        value: '#3b82f6'
      },
      {
        id: 'secondary_color',
        title: 'Secondary Color',
        description: 'Accent color for buttons and highlights',
        type: 'color',
        value: '#10b981'
      },
      {
        id: 'welcome_message',
        title: 'Welcome Message',
        description: 'Message displayed on the login page and dashboard',
        type: 'textarea',
        value: 'Welcome to Nova Universe - Your unified ITSM platform',
        placeholder: 'Enter welcome message'
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Authentication',
    description: 'Configure security policies and authentication settings',
    icon: ShieldCheckIcon,
    settings: [
      {
        id: 'require_mfa',
        title: 'Require Multi-Factor Authentication',
        description: 'Force all users to enable MFA for enhanced security',
        type: 'switch',
        value: true
      },
      {
        id: 'session_timeout',
        title: 'Session Timeout (minutes)',
        description: 'Automatically log out users after this period of inactivity',
        type: 'select',
        value: '480',
        options: [
          { value: '30', label: '30 minutes' },
          { value: '60', label: '1 hour' },
          { value: '120', label: '2 hours' },
          { value: '240', label: '4 hours' },
          { value: '480', label: '8 hours' },
          { value: '1440', label: '24 hours' },
        ]
      },
      {
        id: 'password_policy',
        title: 'Password Policy',
        description: 'Minimum requirements for user passwords',
        type: 'select',
        value: 'medium',
        options: [
          { value: 'low', label: 'Low (8+ characters)' },
          { value: 'medium', label: 'Medium (8+ chars, mixed case, numbers)' },
          { value: 'high', label: 'High (12+ chars, mixed case, numbers, symbols)' },
        ]
      },
      {
        id: 'login_attempts',
        title: 'Max Login Attempts',
        description: 'Number of failed login attempts before account lockout',
        type: 'select',
        value: '5',
        options: [
          { value: '3', label: '3 attempts' },
          { value: '5', label: '5 attempts' },
          { value: '10', label: '10 attempts' },
          { value: 'unlimited', label: 'Unlimited' },
        ]
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Configure system notifications and alerts',
    icon: BellIcon,
    settings: [
      {
        id: 'email_notifications',
        title: 'Email Notifications',
        description: 'Send email notifications for system events',
        type: 'switch',
        value: true
      },
      {
        id: 'sms_notifications',
        title: 'SMS Notifications',
        description: 'Send SMS notifications for critical alerts',
        type: 'switch',
        value: false
      },
      {
        id: 'notification_frequency',
        title: 'Notification Frequency',
        description: 'How often to send digest notifications',
        type: 'select',
        value: 'daily',
        options: [
          { value: 'immediate', label: 'Immediate' },
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
        ]
      },
      {
        id: 'notification_quiet_hours',
        title: 'Quiet Hours',
        description: 'Suppress non-critical notifications during these hours',
        type: 'text',
        value: '22:00 - 08:00',
        placeholder: 'HH:MM - HH:MM'
      }
    ]
  },
  {
    id: 'modules',
    title: 'Module Configuration',
    description: 'Enable and configure Nova Universe modules',
    icon: ComputerDesktopIcon,
    settings: [
      {
        id: 'enable_pulse',
        title: 'Enable Nova Pulse',
        description: 'Technician portal for IT support staff',
        type: 'switch',
        value: true
      },
      {
        id: 'enable_orbit',
        title: 'Enable Nova Orbit',
        description: 'Self-service portal for end users',
        type: 'switch',
        value: true
      },
      {
        id: 'enable_beacon',
        title: 'Enable Nova Beacon',
        description: 'Kiosk portal for walk-up support',
        type: 'switch',
        value: false
      },
      {
        id: 'enable_lore',
        title: 'Enable Nova Lore',
        description: 'Knowledge base and documentation system',
        type: 'switch',
        value: true
      },
      {
        id: 'enable_synth',
        title: 'Enable Nova Synth',
        description: 'Advanced analytics and reporting',
        type: 'switch',
        value: false
      }
    ]
  }
]

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState(mockSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (groupId: string, settingId: string, value: any) => {
    setSettings(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          settings: group.settings.map(setting => {
            if (setting.id === settingId) {
              return { ...setting, value }
            }
            return setting
          })
        }
      }
      return group
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Mock save logic
    console.log('Saving settings:', settings)
    setHasChanges(false)
  }

  const handleReset = () => {
    // Mock reset logic
    setSettings(mockSettings)
    setHasChanges(false)
  }

  const renderSetting = (groupId: string, setting: Setting) => {
    switch (setting.type) {
      case 'text':
        return (
          <Input
            value={setting.value}
            onChange={(e) => handleSettingChange(groupId, setting.id, e.target.value)}
            placeholder={setting.placeholder}
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            value={setting.value}
            onChange={(e) => handleSettingChange(groupId, setting.id, e.target.value)}
            placeholder={setting.placeholder}
            rows={3}
          />
        )
      
      case 'select':
        return (
          <Select
            value={setting.value}
            onValueChange={(value) => handleSettingChange(groupId, setting.id, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'switch':
        return (
          <Switch
            checked={setting.value}
            onCheckedChange={(checked) => handleSettingChange(groupId, setting.id, checked)}
          />
        )
      
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={setting.value}
              onChange={(e) => handleSettingChange(groupId, setting.id, e.target.value)}
              className="w-12 h-10 border border-border rounded cursor-pointer"
            />
            <Input
              value={setting.value}
              onChange={(e) => handleSettingChange(groupId, setting.id, e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        )
      
      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input type="file" className="flex-1" />
              <Button variant="outline" size="sm">Upload</Button>
            </div>
            {setting.value && (
              <p className="text-xs text-muted-foreground">
                Current: {setting.value}
              </p>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your Nova Universe installation
          </p>
        </div>
        
        <div className="flex space-x-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {settings.map((group) => {
            const Icon = group.icon
            return (
              <TabsTrigger key={group.id} value={group.id} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{group.title.split(' ')[0]}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {settings.map((group) => (
          <TabsContent key={group.id} value={group.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <group.icon className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {group.settings.map((setting) => (
                  <div key={setting.id} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor={setting.id} className="text-sm font-medium">
                        {setting.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                    
                    <div className="max-w-md">
                      {renderSetting(group.id, setting)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DocumentTextIcon className="w-5 h-5" />
            <span>System Information</span>
          </CardTitle>
          <CardDescription>Current system status and version information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Version Information</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Nova Universe:</span>
                  <Badge variant="outline">v2.1.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Build:</span>
                  <span>2024.01.15</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge variant="secondary">Production</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">System Health</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>15 days, 8 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>Low (23%)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Database</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>PostgreSQL 15</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>2.1 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span>12/100</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}