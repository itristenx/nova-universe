import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getInventory } from '../lib/api'

export const InventoryPage: React.FC = () => {
  const { data: assets = [] } = useQuery({ queryKey: ['inventory'], queryFn: getInventory })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory</h2>
      <ul className="list-disc pl-5">
        {assets.map(asset => (
          <li key={asset.id}>{asset.name} ({asset.assetTag || 'n/a'}) - {asset.type}</li>
        ))}
      </ul>
    </div>
  )
}
