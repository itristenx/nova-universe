import React from 'react'
import { List, ListItem, ListItemText } from '@nova-universe/ui'

interface Alert {
  id: string
  message: string
  createdAt: string
}

interface Props {
  alerts: Alert[]
}

export const AlertsFeed: React.FC<Props> = ({ alerts }) => (
  <List className="space-y-2">
    {alerts.map(a => (
      <ListItem key={a.id} divider>
        <ListItemText primary={a.message} secondary={new Date(a.createdAt).toLocaleString()} />
      </ListItem>
    ))}
  </List>
)
