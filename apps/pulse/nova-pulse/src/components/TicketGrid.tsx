import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableColumn } from '@heroui/react'
import type { Ticket } from '../types'

interface Props {
  tickets: Ticket[]
  onSelect?: (ticket: Ticket) => void
}

export const TicketGrid: React.FC<Props> = ({ tickets, onSelect }) => (
  <div className="overflow-x-auto">
    <Table
      className="min-w-full"
      selectionMode="single"
      onRowAction={(key) => {
        const ticket = tickets.find(t => t.ticketId === key)
        if (ticket && onSelect) {
          onSelect(ticket)
        }
      }}
    >
      <TableHeader>
        <TableColumn>ID</TableColumn>
        <TableColumn>Title</TableColumn>
        <TableColumn>Priority</TableColumn>
        <TableColumn>Status</TableColumn>
      </TableHeader>
      <TableBody>
        {tickets.map(t => (
          <TableRow key={t.ticketId}>
            <TableCell>
              {t.vipWeight ? <span className="text-yellow-500 mr-1">★</span> : null}
              {t.ticketId}
            </TableCell>
            <TableCell>{t.title}</TableCell>
            <TableCell>{t.priority}</TableCell>
            <TableCell>{t.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)
