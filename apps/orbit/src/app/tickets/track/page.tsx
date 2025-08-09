'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Search, 
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  MessageSquare,
  FileText,
  ExternalLink,
  Download,
  RefreshCw,
  Eye,
  Smartphone,
  Mail
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Types and interfaces
interface TicketStatus {
  id: string;
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'waiting_approval' | 'resolved' | 'closed';
  timestamp: string;
  agent: string;
  note?: string;
  estimated_completion?: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'waiting_approval' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  assigned_agent?: string;
  estimated_completion?: string;
  sla_breach_risk?: boolean;
  status_history: TicketStatus[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
    is_internal: boolean;
  }>;
}

interface NotificationPreferences {
  email_updates: boolean;
  sms_updates: boolean;
  status_changes: boolean;
  new_comments: boolean;
  sla_warnings: boolean;
  resolution_confirmation: boolean;
}

// Search schema
const searchSchema = z.object({
  query: z.string(),
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  date_range: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

// Enhanced Ticket Tracking Component
export default function EnhancedTicketTracking() {
  // State management
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_updates: true,
    sms_updates: false,
    status_changes: true,
    new_comments: true,
    sla_warnings: true,
    resolution_confirmation: true,
  });
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Form management
  const { register, handleSubmit, watch, setValue } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
      status: '',
      priority: '',
      category: '',
      date_range: '',
    }
  });

  // Utility functions
  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'acknowledged':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case 'waiting_approval':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'waiting_approval':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (status: Ticket['status']) => {
    switch (status) {
      case 'submitted':
        return 10;
      case 'acknowledged':
        return 25;
      case 'in_progress':
        return 60;
      case 'waiting_approval':
        return 80;
      case 'resolved':
        return 95;
      case 'closed':
        return 100;
      default:
        return 0;
    }
  };

  const formatTimeRemaining = (estimatedCompletion?: string) => {
    if (!estimatedCompletion) return 'No estimate';
    
    const now = new Date();
    const completion = new Date(estimatedCompletion);
    const diffMs = completion.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Overdue';
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;
    }
  };

  // Mock data
  const generateMockTickets = (): Ticket[] => {
    return [
      {
        id: 'TKT-001',
        title: 'Unable to access company portal',
        description: 'Getting authentication errors when trying to log into the employee portal.',
        category: 'IT Support',
        subcategory: 'Access Issues',
        priority: 'high',
        status: 'in_progress',
        created_at: '2024-08-07T10:00:00Z',
        updated_at: '2024-08-07T14:30:00Z',
        assigned_agent: 'Sarah Chen',
        estimated_completion: '2024-08-08T16:00:00Z',
        sla_breach_risk: false,
        status_history: [
          {
            id: '1',
            status: 'submitted',
            timestamp: '2024-08-07T10:00:00Z',
            agent: 'System',
            note: 'Ticket submitted via portal'
          },
          {
            id: '2',
            status: 'acknowledged',
            timestamp: '2024-08-07T10:15:00Z',
            agent: 'Sarah Chen',
            note: 'Ticket assigned and acknowledged'
          },
          {
            id: '3',
            status: 'in_progress',
            timestamp: '2024-08-07T14:30:00Z',
            agent: 'Sarah Chen',
            note: 'Investigating authentication service logs',
            estimated_completion: '2024-08-08T16:00:00Z'
          }
        ],
        attachments: [
          {
            id: '1',
            name: 'error_screenshot.png',
            url: '/attachments/error_screenshot.png',
            size: 245760
          }
        ],
        comments: [
          {
            id: '1',
            author: 'Sarah Chen',
            content: 'Hi! I&apos;ve received your ticket and am looking into the authentication issue. Can you confirm which browser you&apos;re using?',
            timestamp: '2024-08-07T10:30:00Z',
            is_internal: false
          },
          {
            id: '2',
            author: 'You',
            content: 'I&apos;m using Chrome version 127.0.6533.89. The error happens consistently.',
            timestamp: '2024-08-07T11:00:00Z',
            is_internal: false
          }
        ]
      },
      {
        id: 'TKT-002',
        title: 'Request new software license for Adobe Creative Suite',
        description: 'Need Adobe Creative Suite license for graphic design work on the marketing team.',
        category: 'Procurement',
        subcategory: 'Software Licensing',
        priority: 'medium',
        status: 'waiting_approval',
        created_at: '2024-08-06T15:30:00Z',
        updated_at: '2024-08-07T09:00:00Z',
        assigned_agent: 'Mike Rodriguez',
        estimated_completion: '2024-08-09T17:00:00Z',
        sla_breach_risk: false,
        status_history: [
          {
            id: '1',
            status: 'submitted',
            timestamp: '2024-08-06T15:30:00Z',
            agent: 'System',
            note: 'Procurement request submitted'
          },
          {
            id: '2',
            status: 'acknowledged',
            timestamp: '2024-08-06T16:00:00Z',
            agent: 'Mike Rodriguez',
            note: 'Request reviewed and forwarded to procurement team'
          },
          {
            id: '3',
            status: 'waiting_approval',
            timestamp: '2024-08-07T09:00:00Z',
            agent: 'Mike Rodriguez',
            note: 'Waiting for budget approval from Finance team'
          }
        ]
      },
      {
        id: 'TKT-003',
        title: 'Laptop running very slowly',
        description: 'My work laptop has become extremely slow over the past week. Takes 5+ minutes to boot and applications freeze frequently.',
        category: 'Hardware',
        subcategory: 'Performance Issues',
        priority: 'medium',
        status: 'resolved',
        created_at: '2024-08-05T11:00:00Z',
        updated_at: '2024-08-06T16:30:00Z',
        assigned_agent: 'Alex Thompson',
        estimated_completion: '2024-08-06T17:00:00Z',
        sla_breach_risk: false,
        status_history: [
          {
            id: '1',
            status: 'submitted',
            timestamp: '2024-08-05T11:00:00Z',
            agent: 'System',
            note: 'Hardware issue reported'
          },
          {
            id: '2',
            status: 'acknowledged',
            timestamp: '2024-08-05T11:30:00Z',
            agent: 'Alex Thompson',
            note: 'Scheduled for remote diagnostic'
          },
          {
            id: '3',
            status: 'in_progress',
            timestamp: '2024-08-06T10:00:00Z',
            agent: 'Alex Thompson',
            note: 'Running system cleanup and malware scan'
          },
          {
            id: '4',
            status: 'resolved',
            timestamp: '2024-08-06T16:30:00Z',
            agent: 'Alex Thompson',
            note: 'Cleaned up startup programs and updated drivers. Performance restored.'
          }
        ],
        comments: [
          {
            id: '1',
            author: 'Alex Thompson',
            content: 'I&apos;ve completed the system optimization. Your laptop should be running much faster now. Please test and let me know if you notice any remaining issues.',
            timestamp: '2024-08-06T16:30:00Z',
            is_internal: false
          }
        ]
      }
    ];
  };

  // Data fetching and real-time updates
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockTickets = generateMockTickets();
      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTickets = async () => {
    setRefreshing(true);
    try {
      await fetchTickets();
    } finally {
      setRefreshing(false);
    }
  };

  // Search and filtering
  const onSearch = useCallback((data: SearchFormData) => {
    let filtered = [...tickets];

    // Text search
    if (data.query) {
      const query = data.query.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (data.status && data.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === data.status);
    }

    // Priority filter
    if (data.priority && data.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === data.priority);
    }

    // Category filter
    if (data.category && data.category !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === data.category);
    }

    setFilteredTickets(filtered);
  }, [tickets]);

  const clearFilters = () => {
    setValue('query', '');
    setValue('status', '');
    setValue('priority', '');
    setValue('category', '');
    setFilteredTickets(tickets);
  };

  // Notification preferences
  const updateNotificationPreference = (key: keyof NotificationPreferences, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveNotificationPreferences = async () => {
    try {
      // Simulate API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsNotificationDialogOpen(false);
      // Show success message
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setTickets(prevTickets => {
        const updated = [...prevTickets];
        // Randomly update a ticket status (simulation)
        if (Math.random() < 0.1) { // 10% chance per interval
          const randomIndex = Math.floor(Math.random() * updated.length);
          const ticket = updated[randomIndex];
          if (ticket.status === 'in_progress' && Math.random() < 0.5) {
            // Add a new status update
            const newStatus: TicketStatus = {
              id: Date.now().toString(),
              status: 'in_progress',
              timestamp: new Date().toISOString(),
              agent: ticket.assigned_agent || 'System',
              note: 'Status updated automatically'
            };
            ticket.status_history.push(newStatus);
            ticket.updated_at = new Date().toISOString();
          }
        }
        return updated;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  // Initialize data
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Watch for filter changes
  const watchedValues = watch();
  useEffect(() => {
    onSearch(watchedValues);
  }, [watchedValues, onSearch]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Tickets</h1>
          <p className="text-gray-600 mt-2">
            Monitor the progress of your support requests with real-time updates
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Real-time toggle */}
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${realTimeEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            <span className="text-sm text-gray-600">Real-time</span>
          </div>
          
          {/* Notification settings */}
          <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Notification Preferences</DialogTitle>
                <DialogDescription>
                  Choose how you&apos;d like to be notified about ticket updates
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Delivery methods */}
                <div>
                  <h4 className="font-medium mb-4">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Label htmlFor="email_updates">Email notifications</Label>
                      </div>
                      <Switch
                        id="email_updates"
                        checked={notifications.email_updates}
                        onCheckedChange={(value) => updateNotificationPreference('email_updates', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <Label htmlFor="sms_updates">SMS notifications</Label>
                      </div>
                      <Switch
                        id="sms_updates"
                        checked={notifications.sms_updates}
                        onCheckedChange={(value) => updateNotificationPreference('sms_updates', value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Event types */}
                <div>
                  <h4 className="font-medium mb-4">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="status_changes">Status changes</Label>
                      <Switch
                        id="status_changes"
                        checked={notifications.status_changes}
                        onCheckedChange={(value) => updateNotificationPreference('status_changes', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new_comments">New comments</Label>
                      <Switch
                        id="new_comments"
                        checked={notifications.new_comments}
                        onCheckedChange={(value) => updateNotificationPreference('new_comments', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sla_warnings">SLA breach warnings</Label>
                      <Switch
                        id="sla_warnings"
                        checked={notifications.sla_warnings}
                        onCheckedChange={(value) => updateNotificationPreference('sla_warnings', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="resolution_confirmation">Resolution confirmation</Label>
                      <Switch
                        id="resolution_confirmation"
                        checked={notifications.resolution_confirmation}
                        onCheckedChange={(value) => updateNotificationPreference('resolution_confirmation', value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={saveNotificationPreferences} className="flex-1">
                    Save Preferences
                  </Button>
                  <Button variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTickets}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search input */}
              <div className="lg:col-span-2">
                <Label htmlFor="query">Search tickets</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="query"
                    {...register('query')}
                    placeholder="Search by title, description, or ID..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Status filter */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Priority filter */}
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={watch('priority')} onValueChange={(value) => setValue('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category filter */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="IT Support">IT Support</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Procurement">Procurement</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button type="submit" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results summary */}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredTickets.length} of {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant={activeView === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('grid')}
            >
              Grid
            </Button>
            <Button
              variant={activeView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('list')}
            >
              List
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading tickets...</span>
        </div>
      )}

      {/* No results */}
      {!loading && filteredTickets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or create a new ticket.
            </p>
            <Button>
              <ExternalLink className="w-4 h-4 mr-2" />
              Create New Ticket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tickets grid/list view */}
      {!loading && filteredTickets.length > 0 && (
        <div className={activeView === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                ticket.sla_breach_risk ? 'border-red-200 bg-red-50' : ''
              } ${activeView === 'list' ? 'p-0' : ''}`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardHeader className={activeView === 'list' ? 'pb-3' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-semibold">
                        {ticket.id}
                      </CardTitle>
                      {ticket.sla_breach_risk && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {ticket.title}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className={activeView === 'list' ? 'pt-0' : ''}>
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{getProgressPercentage(ticket.status)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(ticket.status)} className="h-2" />
                  </div>
                  
                  {/* Ticket details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <Badge className={`ml-2 ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{ticket.category}</span>
                    </div>
                    {ticket.assigned_agent && (
                      <>
                        <div>
                          <span className="text-gray-500">Agent:</span>
                          <span className="ml-2 font-medium">{ticket.assigned_agent}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">ETA:</span>
                          <span className="ml-2 font-medium">
                            {formatTimeRemaining(ticket.estimated_completion)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Last updated */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Updated {new Date(ticket.updated_at).toLocaleDateString()} at{' '}
                    {new Date(ticket.updated_at).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {selectedTicket.id}: {selectedTicket.title}
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    Created on {new Date(selectedTicket.created_at).toLocaleDateString()} at{' '}
                    {new Date(selectedTicket.created_at).toLocaleTimeString()}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTicket.status)}
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  {/* Progress */}
                  <div>
                    <h4 className="font-medium mb-3">Progress</h4>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Status</span>
                      <span className="font-medium">{getProgressPercentage(selectedTicket.status)}% Complete</span>
                    </div>
                    <Progress value={getProgressPercentage(selectedTicket.status)} className="h-3" />
                    {selectedTicket.estimated_completion && (
                      <p className="text-sm text-gray-600 mt-2">
                        Estimated completion: {formatTimeRemaining(selectedTicket.estimated_completion)}
                      </p>
                    )}
                  </div>
                  
                  {/* Ticket information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Ticket Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Priority:</span>
                          <Badge className={`ml-2 ${getPriorityColor(selectedTicket.priority)}`}>
                            {selectedTicket.priority}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Category:</span>
                          <span className="ml-2">{selectedTicket.category}</span>
                        </div>
                        {selectedTicket.subcategory && (
                          <div>
                            <span className="text-sm text-gray-500">Subcategory:</span>
                            <span className="ml-2">{selectedTicket.subcategory}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Assignment</h4>
                      <div className="space-y-3">
                        {selectedTicket.assigned_agent ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>{selectedTicket.assigned_agent}</span>
                          </div>
                        ) : (
                          <div className="text-gray-500">Unassigned</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-3">Description</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedTicket.description}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Status Timeline</h4>
                  <div className="space-y-4">
                    {selectedTicket.status_history.map((status, index) => (
                      <div key={status.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-full ${
                            index === selectedTicket.status_history.length - 1 
                              ? 'bg-blue-100' 
                              : 'bg-gray-100'
                          }`}>
                            {getStatusIcon(status.status)}
                          </div>
                          {index < selectedTicket.status_history.length - 1 && (
                            <div className="w-px h-8 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(status.status)}>
                              {status.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(status.timestamp).toLocaleDateString()} at{' '}
                              {new Date(status.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>{status.agent}</strong>
                          </p>
                          {status.note && (
                            <p className="text-sm text-gray-600">{status.note}</p>
                          )}
                          {status.estimated_completion && (
                            <p className="text-sm text-blue-600 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              ETA: {new Date(status.estimated_completion).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="comments" className="mt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Comments & Communication</h4>
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTicket.comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{comment.author}</span>
                              {comment.is_internal && (
                                <Badge variant="secondary" className="text-xs">Internal</Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString()} at{' '}
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No comments yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="attachments" className="mt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Attachments</h4>
                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTicket.attachments.map((attachment) => (
                        <div key={attachment.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium">{attachment.name}</p>
                              <p className="text-sm text-gray-500">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No attachments</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
