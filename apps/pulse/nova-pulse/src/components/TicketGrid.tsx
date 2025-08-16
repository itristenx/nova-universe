import React, { useRef, useState } from 'react';
import styles from './TicketGrid.module.css';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableColumn } from '@heroui/react';
import type { Ticket } from '../types';

interface Props {
  tickets: Ticket[];
  onSelect?: (ticket: Ticket) => void;
}

export const TicketGrid: React.FC<Props> = ({ tickets, onSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pulling, setPulling] = useState(false);
  const [offset, setOffset] = useState(0);

  const startY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    if (containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pulling || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      setOffset(Math.min(delta, 80));
    }
  };

  const onTouchEnd = () => {
    if (offset > 60) {
      window.dispatchEvent(new CustomEvent('pulse:pull_to_refresh'));
    }
    setPulling(false);
    setOffset(0);
    startY.current = null;
  };

  if (containerRef.current) {
    containerRef.current.style.setProperty('--pull-translate', `${offset}px`);
  }

  return (
    <div
      className={`overflow-x-auto ${styles.pullContainer}`}
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Table
        className="min-w-full"
        selectionMode="single"
        onRowAction={(key) => {
          const ticket = tickets.find((t) => t.ticketId === key);
          if (ticket && onSelect) {
            onSelect(ticket);
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
          {tickets.map((t) => (
            <TableRow key={t.ticketId}>
              <TableCell>
                {t.vipWeight ? <span className="mr-1 text-yellow-500">★</span> : null}
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
  );
};
