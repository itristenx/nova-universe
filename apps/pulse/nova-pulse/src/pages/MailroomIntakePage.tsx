import React from 'react'
import { intakePackage } from '../lib/api'

export const MailroomIntakePage: React.FC = () => {
  const [form, setForm] = React.useState<Record<string, any>>({})
  const [result, setResult] = React.useState<any>(null)

  const submit = async () => {
    const { package: pkg } = await intakePackage(form)
    setResult(pkg)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mailroom Intake</h2>
      <div className="space-y-2">
        <label htmlFor="tracking" className="sr-only">Tracking Number</label>
        <input id="tracking" aria-label="Tracking Number" className="border p-2" placeholder="Tracking Number" onChange={e => setForm(f => ({ ...f, tracking_number: e.target.value }))} />
        <label htmlFor="recipient" className="sr-only">Recipient ID</label>
        <input id="recipient" aria-label="Recipient ID" className="border p-2" placeholder="Recipient ID" onChange={e => setForm(f => ({ ...f, recipient_id: e.target.value }))} />
        <label htmlFor="carrier" className="sr-only">Carrier</label>
        <input id="carrier" aria-label="Carrier" className="border p-2" placeholder="Carrier" onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} />
        <button className="px-4 py-2 bg-blue-600 text-white" onClick={submit}>Submit</button>
      </div>
      {result && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
