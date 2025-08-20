import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DevicePhoneMobileIcon,
  QrCodeIcon,
  BellIcon,
  ClockIcon,
  MapPinIcon,
  CameraIcon,
  MicrophoneIcon,
  WifiIcon,
  SignalIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

// Types
interface MobileDevice {
  id: string
  name: string
  platform: 'ios' | 'android'
  version: string
  user: string
  lastSeen: string
  status: 'online' | 'offline' | 'push_only'
  location?: {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: string
  }
  capabilities: {
    push: boolean
    gps: boolean
    camera: boolean
    microphone: boolean
    nfc: boolean
    biometric: boolean
  }
  appVersion: string
  batteryLevel?: number
  networkType?: 'wifi' | 'cellular' | 'offline'
}

interface MobileNotification {
  id: string
  deviceId: string
  title: string
  message: string
  type: 'alert' | 'reminder' | 'update' | 'emergency'
  priority: 'low' | 'normal' | 'high' | 'critical'
  sentAt: string
  deliveredAt?: string
  readAt?: string
  actionUrl?: string
}

interface QRCodeSession {
  id: string
  code: string
  type: 'login' | 'ticket_access' | 'location_checkin' | 'asset_scan'
  expiresAt: string
  data: any
  isActive: boolean
}

export default function MobileCompanionPage() {
  const { t } = useTranslation(['mobile', 'common'])
  const [devices, setDevices] = useState<MobileDevice[]>([])
  const [notifications, setNotifications] = useState<MobileNotification[]>([])
  const [qrSessions, setQrSessions] = useState<QRCodeSession[]>([])
  const [activeTab, setActiveTab] = useState<'devices' | 'notifications' | 'qr'>('devices')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMobileData()
  }, [])

  const loadMobileData = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/mobile')
      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices || [])
        setNotifications(data.notifications || [])
        setQrSessions(data.qrSessions || [])
      } else {
        // Fallback to empty state if API fails
        setDevices([])
        setNotifications([])
        setQrSessions([])
      }
    } catch (error) {
      console.warn('Mobile API unavailable, using fallback data:', error)
      // Fallback to empty state
      setDevices([])
      setNotifications([])
      setQrSessions([])
    }

    setLoading(false)
  }

  const sendPushNotification = async (deviceId: string) => {
    // Simulate sending push notification
    const newNotification: MobileNotification = {
      id: `notif-${Date.now()}`,
      deviceId,
      title: 'Test Notification',
      message: 'This is a test push notification sent from the web console',
      type: 'update',
      priority: 'normal',
      sentAt: 'just now'
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }

  const generateQRCode = (type: QRCodeSession['type']) => {
    const newSession: QRCodeSession = {
      id: `qr-${Date.now()}`,
      code: `NV-${type.toUpperCase()}-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      data: { 
        createdAt: new Date().toISOString(),
        sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`
      },
      isActive: true
    }
    
    setQrSessions(prev => [newSession, ...prev])
  }

  const getDeviceIcon = (platform: string) => {
    return <DevicePhoneMobileIcon className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'push_only':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getNetworkIcon = (networkType?: string) => {
    switch (networkType) {
      case 'wifi':
        return <WifiIcon className="h-4 w-4 text-green-500" />
      case 'cellular':
        return <SignalIcon className="h-4 w-4 text-blue-500" />
      case 'offline':
        return <WifiIcon className="h-4 w-4 text-gray-400" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-6 py-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <DevicePhoneMobileIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('mobile:title')}</h1>
        </div>
        <p className="text-indigo-100">
          {t('mobile:subtitle')}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex space-x-1">
          {(['devices', 'notifications', 'qr'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t(`mobile:tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {activeTab === 'devices' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('mobile:registeredDevices')}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{devices.length} {t('mobile:devices')}</span>
            </div>
          </div>

          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getDeviceIcon(device.platform)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                          {t(`mobile:status.${device.status}`)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>{t('mobile:user')}: {device.user}</div>
                        <div>{t('mobile:platform')}: {device.platform} {device.version}</div>
                        <div>{t('mobile:appVersion')}: {device.appVersion}</div>
                        <div>{t('mobile:lastSeen')}: {device.lastSeen}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Device Stats */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {device.batteryLevel && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">🔋</span>
                          <span>{device.batteryLevel}%</span>
                        </div>
                      )}
                      {getNetworkIcon(device.networkType)}
                    </div>
                    
                    <button
                      onClick={() => sendPushNotification(device.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('mobile:sendPush')}
                    </button>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('mobile:capabilities')}:
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    {Object.entries(device.capabilities).map(([capability, enabled]) => (
                      <div key={capability} className={`flex items-center space-x-1 ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {capability === 'push' && <BellIcon className="h-3 w-3" />}
                        {capability === 'gps' && <MapPinIcon className="h-3 w-3" />}
                        {capability === 'camera' && <CameraIcon className="h-3 w-3" />}
                        {capability === 'microphone' && <MicrophoneIcon className="h-3 w-3" />}
                        {capability === 'nfc' && <QrCodeIcon className="h-3 w-3" />}
                        {capability === 'biometric' && <span className="text-xs">👆</span>}
                        <span className="capitalize">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                {device.location && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500">
                      {t('mobile:location')}: {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)} 
                      ({t('mobile:accuracy')}: {device.location.accuracy}m)
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('mobile:pushNotifications')}
            </h2>
            <button 
              onClick={() => sendPushNotification('broadcast')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('mobile:sendBroadcast')}
            </button>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => {
              const device = devices.find(d => d.id === notification.deviceId)
              return (
                <div
                  key={notification.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>
                          {t(`mobile:priority.${notification.priority}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{t('mobile:device')}: {device?.name || 'Unknown'}</span>
                        <span>{t('mobile:sent')}: {notification.sentAt}</span>
                        {notification.deliveredAt && (
                          <span>{t('mobile:delivered')}: {notification.deliveredAt}</span>
                        )}
                        {notification.readAt && (
                          <span>{t('mobile:read')}: {notification.readAt}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {notification.readAt ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : notification.deliveredAt ? (
                        <ClockIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <BellIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('mobile:qrCodes')}
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => generateQRCode('login')}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('mobile:generateLogin')}
              </button>
              <button 
                onClick={() => generateQRCode('ticket_access')}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('mobile:generateTicket')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrSessions.map((session) => (
              <div
                key={session.id}
                className={`border rounded-lg p-4 ${
                  session.isActive 
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <QrCodeIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <div className="mt-2 text-xs font-mono text-gray-600">
                      {session.code}
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    session.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {session.isActive ? t('mobile:active') : t('mobile:expired')}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><strong>{t('mobile:type')}:</strong> {t(`mobile:qrType.${session.type}`)}</div>
                  <div><strong>{t('mobile:expires')}:</strong> {new Date(session.expiresAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
