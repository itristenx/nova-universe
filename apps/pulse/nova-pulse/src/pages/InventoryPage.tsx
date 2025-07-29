import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getInventory } from '../lib/api'

export const InventoryPage: React.FC = () => {
  const { data: assets = [] } = useQuery({ queryKey: ['inventory'], queryFn: getInventory })
  const [query, setQuery] = useState('')

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory</h2>
      <input className="border px-2 py-1 mb-4" placeholder="Lookup asset" value={query} onChange={e=>setQuery(e.target.value)} />
      <ul className="list-disc pl-5">
        {assets.filter(a => !query || a.assetTag?.includes(query) || a.serialNumber?.includes(query)).map(asset => (
          <li key={asset.id}>{asset.name} ({asset.assetTag || 'n/a'}) - {asset.type}</li>
        ))}
      </ul>
    </div>
  )
}
