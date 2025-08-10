import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getInventory, cmdb } from '../lib/api'

export const InventoryPage: React.FC = () => {
  const { data: assets = [] } = useQuery({ queryKey: ['inventory'], queryFn: getInventory })
  const { data: ciItems = [] } = useQuery({ queryKey: ['cmdb','items'], queryFn: () => cmdb.listItems({ limit: 10 }) })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory</h2>
      <ul className="list-disc pl-5 mb-6">
        {assets.map(asset => (
          <li key={asset.id}>{asset.name} ({asset.assetTag || 'n/a'}) - {asset.type}</li>
        ))}
      </ul>

      <h3 className="text-lg font-semibold mt-8 mb-2">Configuration Items (sample)</h3>
      <ul className="list-disc pl-5">
        {ciItems.map((ci: any) => (
          <li key={ci.id}>{ci.class_name}: {ci.name}</li>
        ))}
      </ul>
    </div>
  )
}
