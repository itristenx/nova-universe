'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTickets, TicketParams } from '../../lib/api';

// Ticket type based on API and best practices
export interface Ticket {
  ticketId: string;
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: { name: string; id: string } | null;
  requester?: { name: string; id: string } | null;

  attachments?: string[];
}
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'on_hold', label: 'On Hold' },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      const params: TicketParams = {
        status: status || undefined,
        limit,
        offset: page * limit,
      };
      try {
        const res = await getTickets(token, params);
        if (res.success) {
          setTickets(res.tickets);
          setHasMore(res.hasMore);
          setTotal(res.total);
        } else {
          setError(res.error || 'Failed to load tickets');
        }
      } catch (err) {
        setError('Failed to load tickets');
        // Optionally log error for debugging
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching tickets:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchTickets();
    }
  }, [status, page, token]);

  if (!token) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>Please log in to view your tickets.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            List and filter all your support tickets here.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tickets/track">
            <Button variant="outline" size="sm">
              Enhanced Tracking
            </Button>
          </Link>
          <Link href="/tickets/new-enhanced">
            <Button size="sm">New Ticket</Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="default" onClick={() => router.push('/tickets/new')}>
            + New Ticket
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-muted-foreground py-12 text-center">Loading tickets...</div>
      ) : error ? (
        <div className="text-destructive py-12 text-center">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">No tickets found.</div>
      ) : (
        <div className="bg-background overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Title</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Priority</th>
                <th className="px-4 py-2 text-left font-semibold">Created</th>
                <th className="px-4 py-2 text-left font-semibold">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-accent cursor-pointer border-t"
                  onClick={() => router.push(`/tickets/${t.ticketId}`)}
                >
                  <td className="px-4 py-2 font-mono">{t.ticketId}</td>
                  <td className="px-4 py-2">{t.title}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2 capitalize">{t.status.replace('_', ' ')}</td>
                  <td className="px-4 py-2 capitalize">{t.priority}</td>
                  <td className="px-4 py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {t.assignedTo?.name || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{total} tickets</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
