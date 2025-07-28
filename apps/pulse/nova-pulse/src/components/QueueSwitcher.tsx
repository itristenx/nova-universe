import React from 'react'
import { Select, MenuItem } from '@nova-universe/ui'

interface Props {
  queues: string[]
  value: string
  onChange: (val: string) => void
}

export const QueueSwitcher: React.FC<Props> = ({ queues, value, onChange }) => (
  <Select value={value} onChange={e => onChange((e.target as HTMLSelectElement).value)} className="mb-4">
    {queues.map(q => (
      <MenuItem key={q} value={q}>
        {q}
      </MenuItem>
    ))}
  </Select>
)
