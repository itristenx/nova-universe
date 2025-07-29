import React from 'react'
import { Table, TableHead, TableRow, TableCell, TableBody } from '@nova-universe/ui'
import type { LeaderboardEntry } from '../types'

interface Props {
  leaderboard: LeaderboardEntry[]
}

export const LeaderboardTable: React.FC<Props> = ({ leaderboard }) => (
  <Table className="min-w-full">
    <TableHead>
      <TableRow>
        <TableCell>Rank</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>XP</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {leaderboard.map((entry, idx) => (
        <TableRow key={entry.userId}>
          <TableCell>{idx + 1}</TableCell>
          <TableCell>{entry.name}</TableCell>
          <TableCell>{entry.xpTotal}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
