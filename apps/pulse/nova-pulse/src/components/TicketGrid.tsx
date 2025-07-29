import React from 'react'
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '@nova-universe/ui'
import type { Ticket } from '../types'

interface Props {
  tickets: Ticket[]
  onSelect?: (ticket: Ticket) => void
}

export const TicketGrid: React.FC<Props> = ({ tickets, onSelect }) => (
  <TableContainer className="overflow-x-auto">
    <Table className="min-w-full text-sm">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tickets.map(t => (
          <TableRow
            key={t.ticketId}
            onClick={() => onSelect?.(t)}
            className="hover:bg-gray-100 cursor-pointer"
          >
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
  </TableContainer>
)
