import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@utils/index'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { apiDocsService, type ApiKey, type OpenAPISpec } from '@services/apiDocs'

export default function APIDocumentationPage() {
  const [activeTab, setActiveTab] = useState<'documentation' | 'keys'>('documentation')
  const [spec, setSpec] = useState<OpenAPISpec | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  useEffect(() => {
    loadSpec()
    loadKeys()
  }, [])

  const loadSpec = async () => {
    try {
      const data = await apiDocsService.getSpec()
      setSpec(data)
    } catch {
      toast.error('Failed to load API documentation')
    }
  }

  const loadKeys = async () => {
    setIsLoading(true)
    try {
      const keys = await apiDocsService.listKeys()
      setApiKeys(keys)
    } catch {
      toast.error('Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const createKey = async () => {
    try {
      const key = await apiDocsService.createKey(newKeyName)
      setApiKeys([...apiKeys, key])
      setNewKeyName('')
      setShowCreateModal(false)
      toast.success('API key created')
    } catch {
      toast.error('Failed to create API key')
    }
  }

  const deleteKey = async (id: string) => {
    if (!confirm('Delete API key?')) return
    try {
      await apiDocsService.deleteKey(id)
      setApiKeys(apiKeys.filter(k => k.id !== id))
      toast.success('API key deleted')
    } catch {
      toast.error('Failed to delete API key')
    }
  }

  const toggleKeyVisibility = (id: string) => {
    const next = new Set(visibleKeys)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setVisibleKeys(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b mb-4">
        <button
          className={cn('pb-2', activeTab === 'documentation' ? 'border-b-2 border-blue-500' : 'text-gray-500')}
          onClick={() => setActiveTab('documentation')}
        >
          Documentation
        </button>
        <button
          className={cn('pb-2', activeTab === 'keys' ? 'border-b-2 border-blue-500' : 'text-gray-500')}
          onClick={() => setActiveTab('keys')}
        >
          API Keys
        </button>
      </div>

      {activeTab === 'documentation' && (
        spec ? (
          <pre className="text-sm overflow-auto bg-gray-50 dark:bg-gray-900 p-4 rounded" style={{ maxHeight: '600px' }}>
            {JSON.stringify(spec, null, 2)}
          </pre>
        ) : (
          <LoadingSpinner />
        )
      )}

      {activeTab === 'keys' && (
        <div>
          <div className="mb-4">
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded"
              onClick={() => setShowCreateModal(true)}
            >
              Create Key
            </button>
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <ul className="divide-y divide-gray-200">
              {apiKeys.map(key => (
                <li key={key.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      {visibleKeys.has(key.id) ? key.key : '••••••••'}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="text-sm text-blue-600"
                    >
                      {visibleKeys.has(key.id) ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg space-y-4">
            <h2 className="text-lg font-medium">Create API Key</h2>
            <input
              className="w-full border p-2 rounded"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name"
            />
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-2" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={createKey}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
