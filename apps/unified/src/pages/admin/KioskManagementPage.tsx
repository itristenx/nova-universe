import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  KioskService,
  type Kiosk,
  type KioskActivation,
  type GlobalStatus,
  type NewKioskData
} from '@services/kiosk'

export default function KioskManagementPage() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([])
  const [activations, setActivations] = useState<KioskActivation[]>([])
  const [globalStatus, setGlobalStatus] = useState<GlobalStatus>('enabled')
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [newKioskData, setNewKioskData] = useState<NewKioskData>({
    name: '',
    location: '',
    assetTag: '',
    serialNumber: ''
  })

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [kioskList, activationList, status] = await Promise.all([
        KioskService.getAll(),
        KioskService.getActivations(),
        KioskService.getGlobalStatus()
      ])
      setKiosks(kioskList)
      setActivations(activationList)
      setGlobalStatus(status)
    } catch {
      toast.error('Failed to load kiosks')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: GlobalStatus) => {
    setStatusLoading(true)
    try {
      await KioskService.updateGlobalStatus(status)
      setGlobalStatus(status)
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const updated = await KioskService.updateStatus(id, active)
      setKiosks(kiosks.map(k => (k.id === id ? updated : k)))
    } catch {
      toast.error('Failed to update kiosk')
    }
  }

  const deleteKiosk = async (id: string) => {
    if (!confirm('Delete kiosk?')) return
    try {
      await KioskService.delete(id)
      setKiosks(kiosks.filter(k => k.id !== id))
      toast.success('Kiosk deleted')
    } catch {
      toast.error('Failed to delete kiosk')
    }
  }

  const generateActivationCode = async () => {
    setGeneratingCode(true)
    try {
      const activation = await KioskService.generateActivationCode(newKioskData)
      setActivations([activation, ...activations])
      setShowActivationModal(false)
      setNewKioskData({ name: '', location: '', assetTag: '', serialNumber: '' })
      toast.success('Activation code generated')
    } catch {
      toast.error('Failed to generate activation code')
    } finally {
      setGeneratingCode(false)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kiosk Management</h1>
        <select
          value={globalStatus}
          onChange={e => updateStatus(e.target.value as GlobalStatus)}
          disabled={statusLoading}
          className="border rounded p-1"
        >
          <option value="enabled">Open</option>
          <option value="disabled">Closed</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowActivationModal(true)}
        >
          Generate Activation Code
        </button>
      </div>

      <ul className="divide-y divide-gray-200">
        {kiosks.map(kiosk => (
          <li key={kiosk.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{kiosk.name}</p>
              <p className="text-sm text-gray-500">
                {kiosk.location} - {kiosk.status}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => toggleActive(kiosk.id, !kiosk.active)}
                className="text-sm text-blue-600"
              >
                {kiosk.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => deleteKiosk(kiosk.id)}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-8">Activation Codes</h2>
      <ul className="divide-y divide-gray-200">
        {activations.map(act => (
          <li key={act.id} className="py-3 flex items-center justify-between">
            <span>{act.code}</span>
            <span className="text-sm text-gray-500">
              {new Date(act.expiresAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      {showActivationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded space-y-4 w-96">
            <h2 className="text-lg font-medium">New Kiosk Activation</h2>
            <input
              className="w-full border p-2 rounded"
              placeholder="Name"
              value={newKioskData.name}
              onChange={e => setNewKioskData({ ...newKioskData, name: e.target.value })}
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Location"
              value={newKioskData.location}
              onChange={e => setNewKioskData({ ...newKioskData, location: e.target.value })}
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Asset Tag"
              value={newKioskData.assetTag}
              onChange={e => setNewKioskData({ ...newKioskData, assetTag: e.target.value })}
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Serial Number"
              value={newKioskData.serialNumber}
              onChange={e => setNewKioskData({ ...newKioskData, serialNumber: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowActivationModal(false)}>Cancel</button>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={generateActivationCode}
                disabled={generatingCode}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
