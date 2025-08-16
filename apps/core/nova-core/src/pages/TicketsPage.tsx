import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Chip } from '@/components/ui';
import { MagnifyingGlassIcon, FunnelIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { formatDate, getUrgencyColor, getStatusColor } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Log } from '@/types';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { addToast } = useToastStore();

  // Setup WebSocket for real-time ticket updates
  const { isConnected } = useWebSocket({
    subscriptions: ['tickets'],
    onMessage: (message) => {
      console.log('Tickets page received update:', message);
      setLastUpdate(new Date());
      
      switch (message.type) {
        case 'ticket_created':
          setTickets(prev => [message.data, ...prev]);
          addToast({
            type: 'info',
            title: 'New Ticket',
            description: `Ticket #${message.data.id} has been created`,
          });
          break;
        case 'ticket_updated':
          setTickets(prev => prev.map(ticket => 
            ticket.id === message.data.id ? { ...ticket, ...message.data } : ticket
          ));
          break;
        case 'ticket_deleted':
          setTickets(prev => prev.filter(ticket => ticket.id !== message.data.id));
          break;
        default:
          console.log('Unhandled ticket message type:', message.type);
      }
    }
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getLogs();
      setTickets(data);
    } catch (error: any) {
      console.error('Failed to load tickets:', error);
      addToast({
        type: 'error',
        title: 'Error loading tickets',
        description: 'Unable to load support tickets. Please try refreshing the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (id: number) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      try {
        await api.deleteLog(id);
        setTickets(tickets.filter(t => t.id !== id));
        addToast({
          type: 'success',
          title: 'Ticket deleted',
          description: 'The ticket has been successfully deleted.',
        });
      } catch (error: any) {
        console.error('Failed to delete ticket:', error);
        addToast({
          type: 'error',
          title: 'Failed to delete ticket',
          description: error.response?.data?.error || 'Unable to delete the ticket. Please try again.',
        });
      }
    }
  };

  const clearAllTickets = async () => {
    if (confirm('Are you sure you want to clear all tickets? This action cannot be undone.')) {
      try {
        await api.clearLogs();
        setTickets([]);
        addToast({
          type: 'success',
          title: 'All tickets cleared',
          description: 'All support tickets have been successfully deleted.',
        });
      } catch (error: any) {
        console.error('Failed to clear tickets:', error);
        addToast({
          type: 'error',
          title: 'Failed to clear tickets',
          description: error.response?.data?.error || 'Unable to clear tickets. Please try again.',
        });
      }
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.name.toLowerCase().includes(search.toLowerCase()) ||
      ticket.email.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.system.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || ticket.emailStatus === statusFilter;
    const matchesUrgency = !urgencyFilter || ticket.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <Chip 
              color={isConnected ? "success" : "warning"} 
              variant="flat" 
              size="sm"
              title={isConnected ? "Live updates enabled" : "Live updates offline"}
            >
              {isConnected ? "🟢 Live" : "🟡 Offline"}
            </Chip>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track support requests from your kiosks
            {isConnected && (
              <span className="ml-2 text-xs text-green-600">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button
          color="danger"
          onClick={clearAllTickets}
          disabled={tickets.length === 0}
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="fail">Failed</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="input"
            aria-label="Filter by urgency"
          >
            <option value="">All Urgencies</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
          <div className="flex items-center text-sm text-gray-600">
            <FunnelIcon className="h-4 w-4 mr-1" />
            {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {tickets.length === 0 ? 'No support tickets have been submitted yet.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{ticket.ticketId}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {ticket.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.name}</div>
                        <div className="text-sm text-gray-500">{ticket.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.system}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(ticket.urgency)}`}>
                        {ticket.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.emailStatus)}`}>
                        {ticket.emailStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => deleteTicket(ticket.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
