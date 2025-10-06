import React, { useState } from 'react';
import {
  LiquidGlassShell,
  WorkspaceLayout,
  WorkspaceCard,
  ContextPanel,
  ContextPanelSection,
  ContextPanelField,
  DynamicIsland,
  useDynamicIsland,
  DataGrid,
  type WorkspaceTab,
  type DataGridColumn,
} from '../../components/design-system';
import { 
  Ticket, 
  Package, 
  User, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle 
} from 'lucide-react';

// Sample data for DataGrid
interface SampleTicket {
  id: string;
  number: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Pending' | 'Resolved';
  assignee: string;
  createdAt: string;
}

const sampleTickets: SampleTicket[] = [
  {
    id: '1',
    number: 'INC0001',
    title: 'Unable to access VPN',
    priority: 'High',
    status: 'Open',
    assignee: 'John Doe',
    createdAt: '2025-10-06T10:00:00Z',
  },
  {
    id: '2',
    number: 'INC0002',
    title: 'Laptop running slow',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'Jane Smith',
    createdAt: '2025-10-06T09:30:00Z',
  },
  {
    id: '3',
    number: 'INC0003',
    title: 'Email not syncing',
    priority: 'Low',
    status: 'Pending',
    assignee: 'Bob Wilson',
    createdAt: '2025-10-06T08:15:00Z',
  },
  {
    id: '4',
    number: 'INC0004',
    title: 'Printer offline',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Alice Johnson',
    createdAt: '2025-10-05T15:45:00Z',
  },
  {
    id: '5',
    number: 'INC0005',
    title: 'Software installation request',
    priority: 'Low',
    status: 'Open',
    assignee: 'Charlie Brown',
    createdAt: '2025-10-05T14:20:00Z',
  },
];

const getPriorityBadge = (priority: string) => {
  const colors = {
    Critical: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    High: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    Medium: 'bg-apple-blue/10 text-apple-blue dark:text-apple-blue-dark',
    Low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-sf-text font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority}
    </span>
  );
};

const getStatusBadge = (status: string) => {
  const colors = {
    Open: 'bg-apple-blue/10 text-apple-blue dark:text-apple-blue-dark',
    'In Progress': 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    Pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    Resolved: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-sf-text font-medium ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
};

const ticketColumns: DataGridColumn<SampleTicket>[] = [
  {
    id: 'number',
    header: 'Number',
    accessor: 'number',
    width: '120px',
    sortable: true,
  },
  {
    id: 'title',
    header: 'Title',
    accessor: 'title',
    sortable: true,
    editable: true,
  },
  {
    id: 'priority',
    header: 'Priority',
    accessor: 'priority',
    width: '120px',
    sortable: true,
    cell: (row, value) => getPriorityBadge(value),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    width: '140px',
    sortable: true,
    cell: (row, value) => getStatusBadge(value),
  },
  {
    id: 'assignee',
    header: 'Assignee',
    accessor: 'assignee',
    sortable: true,
    editable: true,
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessor: 'createdAt',
    width: '150px',
    sortable: true,
    cell: (row, value) => new Date(value).toLocaleDateString(),
  },
];

export const LiquidGlassShowcasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SampleTicket | null>(null);
  const dynamicIsland = useDynamicIsland();

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'tickets',
      title: 'Tickets',
      icon: <Ticket className="w-4 h-4" />,
      content: (
        <div className="p-6 space-y-6">
          <WorkspaceCard
            title="Active Tickets"
            subtitle="Manage and track all service tickets"
            actions={
              <button
                onClick={() => {
                  dynamicIsland.success('Ticket created', 'INC0006 has been created successfully');
                }}
                className="px-4 py-2 bg-apple-blue hover:bg-apple-blue-dark text-white rounded-apple-sm font-sf-text text-sm transition-all duration-400 ease-apple hover-lift"
              >
                Create Ticket
              </button>
            }
          >
            <DataGrid
              columns={ticketColumns}
              data={sampleTickets}
              onRowClick={(ticket) => {
                setSelectedTicket(ticket);
                setContextPanelOpen(true);
              }}
              onEdit={async (ticket, field, value) => {
                dynamicIsland.info('Updating ticket', `Saving changes to ${ticket.number}...`);
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                dynamicIsland.success('Updated', `${ticket.number} has been updated`);
              }}
              selectable
              onSelectionChange={(selected) => {
                if (selected.length > 0) {
                  dynamicIsland.info('Selected', `${selected.length} ticket(s) selected`);
                }
              }}
            />
          </WorkspaceCard>
        </div>
      ),
      closeable: false,
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Package className="w-4 h-4" />,
      content: (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <WorkspaceCard padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-apple bg-apple-blue/10 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-apple-blue" />
                </div>
                <div>
                  <p className="text-2xl font-sf-display font-bold text-gray-900 dark:text-white">
                    24
                  </p>
                  <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
                    Open Tickets
                  </p>
                </div>
              </div>
            </WorkspaceCard>

            <WorkspaceCard padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-apple bg-warning-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning-600" />
                </div>
                <div>
                  <p className="text-2xl font-sf-display font-bold text-gray-900 dark:text-white">
                    12
                  </p>
                  <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
                    In Progress
                  </p>
                </div>
              </div>
            </WorkspaceCard>

            <WorkspaceCard padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-apple bg-success-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <p className="text-2xl font-sf-display font-bold text-gray-900 dark:text-white">
                    156
                  </p>
                  <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
                    Resolved Today
                  </p>
                </div>
              </div>
            </WorkspaceCard>

            <WorkspaceCard padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-apple bg-error-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-error-600" />
                </div>
                <div>
                  <p className="text-2xl font-sf-display font-bold text-gray-900 dark:text-white">
                    3
                  </p>
                  <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
                    Critical
                  </p>
                </div>
              </div>
            </WorkspaceCard>
          </div>

          <WorkspaceCard title="Recent Activity" subtitle="Latest updates from your team">
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-apple-blue mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-sf-text text-gray-900 dark:text-white">
                    <span className="font-semibold">John Doe</span> resolved INC0123
                  </p>
                  <p className="text-xs font-sf-text text-gray-500 dark:text-gray-400 mt-1">
                    2 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-success-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-sf-text text-gray-900 dark:text-white">
                    <span className="font-semibold">Jane Smith</span> created REQ0045
                  </p>
                  <p className="text-xs font-sf-text text-gray-500 dark:text-gray-400 mt-1">
                    5 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-warning-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-sf-text text-gray-900 dark:text-white">
                    <span className="font-semibold">Bob Wilson</span> commented on INC0098
                  </p>
                  <p className="text-xs font-sf-text text-gray-500 dark:text-gray-400 mt-1">
                    12 minutes ago
                  </p>
                </div>
              </div>
            </div>
          </WorkspaceCard>
        </div>
      ),
      closeable: true,
    },
  ];

  return (
    <>
      <LiquidGlassShell>
        <WorkspaceLayout
          tabs={workspaceTabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          onTabClose={(tabId) => {
            dynamicIsland.info('Tab closed', `${tabId} tab has been closed`);
          }}
          sidebar={
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-sf-text font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Quick Filters
                </h3>
                <div className="space-y-1">
                  <button className="w-full px-3 py-2 text-left text-sm font-sf-text text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-apple-sm transition-all duration-400 ease-apple">
                    My Tickets (24)
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm font-sf-text text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-apple-sm transition-all duration-400 ease-apple">
                    Unassigned (12)
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm font-sf-text text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-apple-sm transition-all duration-400 ease-apple">
                    High Priority (8)
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm font-sf-text text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-apple-sm transition-all duration-400 ease-apple">
                    Overdue (3)
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-sf-text font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Saved Views
                </h3>
                <div className="space-y-1">
                  <button className="w-full px-3 py-2 text-left text-sm font-sf-text text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-apple-sm transition-all duration-400 ease-apple">
                    Critical Issues
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm font-sf-text text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-apple-sm transition-all duration-400 ease-apple">
                    This Week
                  </button>
                </div>
              </div>
            </div>
          }
          contextPanel={
            selectedTicket && (
              <div className="p-6 space-y-6">
                <ContextPanelSection>
                  <div className="space-y-4">
                    <ContextPanelField label="Number" value={selectedTicket.number} inline />
                    <ContextPanelField label="Title" value={selectedTicket.title} inline />
                    <ContextPanelField label="Priority" value={getPriorityBadge(selectedTicket.priority)} inline />
                    <ContextPanelField label="Status" value={getStatusBadge(selectedTicket.status)} inline />
                    <ContextPanelField label="Assignee" value={selectedTicket.assignee} inline />
                    <ContextPanelField 
                      label="Created" 
                      value={new Date(selectedTicket.createdAt).toLocaleString()} 
                      inline 
                    />
                  </div>
                </ContextPanelSection>

                <ContextPanelSection title="Actions" collapsible defaultExpanded>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-apple-blue hover:bg-apple-blue-dark text-white rounded-apple-sm font-sf-text text-sm transition-all duration-400 ease-apple hover-lift">
                      Assign to Me
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-apple-sm font-sf-text text-sm transition-all duration-400 ease-apple">
                      Add Comment
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-apple-sm font-sf-text text-sm transition-all duration-400 ease-apple">
                      Change Status
                    </button>
                  </div>
                </ContextPanelSection>

                <ContextPanelSection title="Activity" collapsible defaultExpanded>
                  <div className="space-y-3">
                    <div className="text-sm font-sf-text">
                      <p className="text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">System</span> created this ticket
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </ContextPanelSection>
              </div>
            )
          }
          contextPanelOpen={contextPanelOpen}
          onContextPanelClose={() => setContextPanelOpen(false)}
        />
      </LiquidGlassShell>

      {/* Dynamic Island for notifications */}
      <DynamicIsland
        notifications={dynamicIsland.notifications}
        onDismiss={dynamicIsland.dismiss}
        position="top"
      />
    </>
  );
};

export default LiquidGlassShowcasePage;
