import { useState, useEffect } from 'react'
import { withMockFallback } from '@utils/index'

// Toast utility function
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message)
}

// Simple icon components to avoid React 19 compatibility issues
const ComputerDesktopIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
  </svg>
)

const PowerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
  </svg>
)

const QrCodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5H15V15h-1.5v-1.5zM15 13.5h1.5V15H15v-1.5zM13.5 15H15v1.5h-1.5V15zM15 15h1.5v1.5H15V15z" />
  </svg>
)

const CogIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const ClipboardDocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.375A2.25 2.25 0 014.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
)

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface Kiosk {
  id: string
  name: string
  location: string
  status: 'online' | 'offline' | 'maintenance'
  active: boolean
  lastSeen: string
  version: string
  todayTickets: number
  totalTickets: number
  uptime: string
  health: number
  assetTag?: string
  serialNumber?: string
  ipAddress?: string
}

interface KioskActivation {
  id: string
  code: string
  qrCode?: string
  expiresAt: string
  kioskId?: string
  createdAt: string
  used: boolean
}

type GlobalStatus = 'open' | 'closed' | 'meeting' | 'brb' | 'lunch' | 'unavailable'

export default function KioskManagementPage() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([])
  const [activations, setActivations] = useState<KioskActivation[]>([])
  const [globalStatus, setGlobalStatus] = useState<GlobalStatus>('open')
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [newKioskData, setNewKioskData] = useState({
    name: '',
    location: '',
    assetTag: '',
    serialNumber: ''
  })

  useEffect(() => {
    loadKiosks()
    loadGlobalStatus()
    loadActivations()
  }, [])

  const loadKiosks = async () => {
    setLoading(true)
    try {
      // Mock data for development/demo
      const mockKiosks: Kiosk[] = [
        {
          id: 'kiosk-001',
          name: 'Main Lobby Kiosk',
          location: 'Building A - Main Lobby',
          status: 'online',
          active: true,
          lastSeen: new Date().toISOString(),
          version: '2.1.4',
          todayTickets: 12,
          totalTickets: 1847,
          uptime: '99.8%',
          health: 98,
          assetTag: 'KIOSK-001',
          serialNumber: 'SN123456789',
          ipAddress: '192.168.1.101'
        },
        {
          id: 'kiosk-002',
          name: 'IT Department Kiosk',
          location: 'Building B - IT Floor',
          status: 'offline',
          active: false,
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
          version: '2.1.3',
          todayTickets: 0,
          totalTickets: 543,
          uptime: '85.2%',
          health: 45,
          assetTag: 'KIOSK-002',
          serialNumber: 'SN987654321',
          ipAddress: '192.168.1.102'
        }
      ]

      // Use utility function to handle API vs mock data
      const kiosks = await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.getKiosks()
        },
        mockKiosks,
        'Using mock kiosks for demo'
      )
      
      setKiosks(kiosks)
    } catch (error) {
      console.error('Failed to load kiosks:', error)
      toast.error('Failed to load kiosks')
    } finally {
      setLoading(false)
    }
  }

  const loadGlobalStatus = async () => {
    try {
      // Use utility function to handle API vs mock operation
      const status = await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.getGlobalStatus()
        },
        'enabled' as GlobalStatus, // Mock default status
        'Using mock global status for demo'
      )
      
      setGlobalStatus(status)
    } catch (error) {
      console.error('Failed to load global status:', error)
    }
  }

  const loadActivations = async () => {
    try {
      // Mock data for development/demo
      const mockActivations: KioskActivation[] = [
        {
          id: 'act-001',
          code: 'ABC123',
          qrCode: 'data:image/png;base64,iVBOR...',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          used: false
        }
      ]

      // Use utility function to handle API vs mock data
      const activations = await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.getKioskActivations()
        },
        mockActivations,
        'Using mock activations for demo'
      )
      
      setActivations(activations)
    } catch (error) {
      console.error('Failed to load activations:', error)
    }
  }

  const updateGlobalStatus = async (status: GlobalStatus) => {
    setStatusLoading(true)
    try {
      // Use utility function to handle API vs mock operation
      await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.updateGlobalStatus(status)
        },
        undefined, // Mock operation - just succeed silently
        `Simulating status update to ${status}`
      )
      
      setGlobalStatus(status)
      toast.success(`Status updated to ${status}`)
    } catch (error) {
      console.error('Failed to update global status:', error)
      toast.error('Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  const toggleKioskActive = async (id: string, active: boolean) => {
    try {
      // Use utility function to handle API vs mock operation
      await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.toggleKiosk(id, !active)
        },
        undefined, // Mock operation - just succeed silently
        `Simulating kiosk ${!active ? 'activation' : 'deactivation'}`
      )
      
      setKiosks(kiosks.map(k => k.id === id ? { ...k, active: !active } : k))
      toast.success(`Kiosk ${!active ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Failed to toggle kiosk:', error)
      toast.error('Failed to toggle kiosk status')
    }
  }

  const deleteKiosk = async (id: string) => {
    if (!confirm('Are you sure you want to delete this kiosk?')) return
    
    try {
      // Use utility function to handle API vs mock operation
      await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.deleteKiosk(id)
        },
        undefined, // Mock operation - just succeed silently
        `Simulating deletion of kiosk ${id}`
      )
      
      setKiosks(kiosks.filter(k => k.id !== id))
      toast.success('Kiosk deleted successfully')
    } catch (error) {
      console.error('Failed to delete kiosk:', error)
      toast.error('Failed to delete kiosk')
    }
  }

  const generateActivationCode = async () => {
    setGeneratingCode(true)
    try {
      // Mock data for new activation
      const newActivation: KioskActivation = {
        id: `act-${Date.now()}`,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        used: false
      }

      // Use utility function to handle API vs mock operation
      await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.generateActivationCode(newKioskData)
        },
        undefined, // Mock operation - just succeed silently
        'Simulating activation code generation'
      )
      
      setActivations([newActivation, ...activations])
      toast.success('Activation code generated successfully')
      setShowActivationModal(false)
      setNewKioskData({ name: '', location: '', assetTag: '', serialNumber: '' })
    } catch (error) {
      console.error('Failed to generate activation code:', error)
      toast.error('Failed to generate activation code')
    } finally {
      setGeneratingCode(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'offline': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getHealthWidth = (health: number) => {
    if (health >= 95) return 'w-full'
    if (health >= 90) return 'w-11/12'
    if (health >= 80) return 'w-4/5'
    if (health >= 70) return 'w-3/4'
    if (health >= 60) return 'w-3/5'
    if (health >= 50) return 'w-1/2'
    if (health >= 40) return 'w-2/5'
    if (health >= 30) return 'w-1/3'
    if (health >= 20) return 'w-1/4'
    if (health >= 10) return 'w-1/12'
    return 'w-1'
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-green-500'
    if (health >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getGlobalStatusIcon = (status: GlobalStatus) => {
    switch (status) {
      case 'open': return '🟢'
      case 'closed': return '🔴'
      case 'meeting': return '📝'
      case 'brb': return '⏰'
      case 'lunch': return '🍽️'
      case 'unavailable': return '❌'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Kiosk Management
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage kiosks and global status indicators
            </p>
          </div>
        </div>
        
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading kiosk data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Kiosk Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage kiosks, activation codes, and global status indicators
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadKiosks}
            disabled={loading}
            className="btn btn-secondary"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowActivationModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Add Kiosk
          </button>
        </div>
      </div>

      {/* Global Status Control */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <span>{getGlobalStatusIcon(globalStatus)}</span>
            <span>Global Status Control</span>
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Control the global status displayed on all kiosks
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(['open', 'closed', 'meeting', 'brb', 'lunch', 'unavailable'] as GlobalStatus[]).map((status) => (
              <label key={status} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="globalStatus"
                  value={status}
                  checked={globalStatus === status}
                  onChange={() => updateGlobalStatus(status)}
                  disabled={statusLoading}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize flex items-center space-x-1">
                  <span>{getGlobalStatusIcon(status)}</span>
                  <span>{status}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Kiosks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {kiosks.map((kiosk) => (
          <div key={kiosk.id} className="card">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {kiosk.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {kiosk.location}
                    </p>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(kiosk.status)}`}>
                  {kiosk.status}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {kiosk.todayTickets}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Today
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {kiosk.totalTickets.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Health</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{kiosk.health}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getHealthColor(kiosk.health)} ${getHealthWidth(kiosk.health)}`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{kiosk.uptime}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Version:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">v{kiosk.version}</span>
                </div>

                {kiosk.assetTag && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Asset Tag:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{kiosk.assetTag}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleKioskActive(kiosk.id, kiosk.active)}
                    className={`btn btn-sm ${kiosk.active ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    <PowerIcon className="h-4 w-4" />
                    {kiosk.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Open kiosk configuration modal
                      toast.error('Kiosk configuration feature not yet implemented')
                    }}
                    className="btn btn-sm btn-secondary"
                    title="Configure kiosk"
                  >
                    <CogIcon className="h-4 w-4" />
                    Configure
                  </button>
                </div>
                
                <button
                  onClick={() => deleteKiosk(kiosk.id)}
                  className="btn btn-sm btn-secondary text-red-600 hover:text-red-700"
                  title="Delete kiosk"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Activation Codes */}
      {activations.length > 0 && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Active Activation Codes
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Unused activation codes for new kiosk setup
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activations.filter(a => !a.used).map((activation) => (
                <div key={activation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                        {activation.code}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Expires: {new Date(activation.expiresAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activation.code)}
                      className="btn btn-sm btn-secondary"
                      title="Copy activation code"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Kiosk Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Add New Kiosk
                </h3>
                <button
                  onClick={() => setShowActivationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kiosk Name
                  </label>
                  <input
                    type="text"
                    value={newKioskData.name}
                    onChange={(e) => setNewKioskData({...newKioskData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="e.g., Main Lobby Kiosk"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newKioskData.location}
                    onChange={(e) => setNewKioskData({...newKioskData, location: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="e.g., Building A - Main Lobby"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Asset Tag (optional)
                  </label>
                  <input
                    type="text"
                    value={newKioskData.assetTag}
                    onChange={(e) => setNewKioskData({...newKioskData, assetTag: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="e.g., KIOSK-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Serial Number (optional)
                  </label>
                  <input
                    type="text"
                    value={newKioskData.serialNumber}
                    onChange={(e) => setNewKioskData({...newKioskData, serialNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="e.g., SN123456789"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowActivationModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={generateActivationCode}
                  disabled={generatingCode || !newKioskData.name || !newKioskData.location}
                  className="btn btn-primary"
                >
                  {generatingCode ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCodeIcon className="h-4 w-4" />
                      Generate Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
