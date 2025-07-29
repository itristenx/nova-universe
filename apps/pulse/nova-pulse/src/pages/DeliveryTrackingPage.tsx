import React from 'react'
import { updatePackageStatus } from '../lib/api'

export const DeliveryTrackingPage: React.FC = () => {
  const [id, setId] = React.useState('')
  const [status, setStatus] = React.useState('ready')
  const [result, setResult] = React.useState<any>(null)

  const submit = async () => {
    const { package: pkg } = await updatePackageStatus(Number(id), status)
    setResult(pkg)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Delivery Tracking</h2>
      <div className="space-y-2">
        <input className="border p-2" placeholder="Package ID" value={id} onChange={e => setId(e.target.value)} />
        <select className="border p-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="ready">Ready</option>
          <option value="picked_up">Picked Up</option>
          <option value="returned">Returned</option>
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white" onClick={submit}>Update</button>
      </div>
      {result && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
