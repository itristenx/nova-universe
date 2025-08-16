/**
 * Nova Universe Ticket Management Interface
 * Phase 3 Implementation - Real ticket management using design system
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, CardTitle, CardText, CardActions,
  Button, PrimaryButton, OutlineButton, GhostButton,
  Input, Label,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Toast,
  Progress, Spinner, Skeleton,
  useTheme
} from '../../packages/design-system';

// Import mock data
import { mockLogs } from '../lib/mockData';

const ticketStyles = `
.ticket-management {
  padding: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--color-background);
  min-height: 100vh;
}

.ticket-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.ticket-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0;
  flex: 1;
}

.ticket-filters {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 120px;
}

.filter-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ticket-grid {
  display: grid;
  gap: var(--space-4);
}

.ticket-card {
  border: 1px solid var(--color-muted)20;
  transition: all var(--duration-200) var(--ease-in-out);
}

.ticket-card:hover {
  border-color: var(--color-primary)40;
  transform: translateY(-2px);
}

.ticket-card--urgent {
  border-left: 4px solid var(--color-error);
}

.ticket-card--high {
  border-left: 4px solid var(--color-warning);
}

.ticket-card--medium {
  border-left: 4px solid var(--color-info);
}

.ticket-card--low {
  border-left: 4px solid var(--color-success);
}

.ticket-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.ticket-id {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-primary);
  background-color: var(--color-primary)10;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
}

.ticket-status {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ticket-status--open {
  background-color: var(--color-info)20;
  color: var(--color-info);
}

.ticket-status--in-progress {
  background-color: var(--color-warning)20;
  color: var(--color-warning);
}

.ticket-status--resolved {
  background-color: var(--color-success)20;
  color: var(--color-success);
}

.ticket-status--closed {
  background-color: var(--color-muted)20;
  color: var(--color-muted);
}

.ticket-title-text {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-content);
  margin: 0 0 var(--space-2) 0;
  line-height: 1.4;
}

.ticket-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.ticket-meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.ticket-description {
  color: var(--color-content);
  line-height: 1.5;
  margin-bottom: var(--space-4);
}

.ticket-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.ticket-tag {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-surface);
  color: var(--color-muted);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-muted)20;
}

.ticket-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-muted)20;
}

.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: var(--space-1);
}

.priority-indicator--critical {
  background-color: var(--color-error);
  box-shadow: 0 0 6px var(--color-error)60;
}

.priority-indicator--high {
  background-color: var(--color-warning);
}

.priority-indicator--medium {
  background-color: var(--color-info);
}

.priority-indicator--low {
  background-color: var(--color-success);
}

.loading-grid {
  display: grid;
  gap: var(--space-4);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--color-muted);
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-2) 0;
}

.empty-state-description {
  margin: 0 0 var(--space-6) 0;
}

@media (max-width: 768px) {
  .ticket-management {
    padding: var(--space-4);
  }
  
  .ticket-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ticket-filters {
    flex-direction: column;
  }
  
  .ticket-actions {
    flex-direction: column;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = ticketStyles;
  document.head.appendChild(styleElement);
}

export default function _TicketManagement() {
  const { colorMode } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    search: ''
  });

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800)); // TODO-LINT: move to async function
      
      setTickets(mockLogs);
      setLoading(false);
    };

    loadTickets();
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status.toLowerCase().replace(' ', '-') !== filters.status) {
      return false;
    }
    
    if (filters.urgency !== 'all' && ticket.urgency.toLowerCase() !== filters.urgency) {
      return false;
    }
    
    if (filters.search && !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.ticketId.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleStatusUpdate = (ticketId, newStatus) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  const getPriorityColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase().replace(' ', '-')) {
      case 'open': return 'open';
      case 'in-progress': return 'in-progress';
      case 'resolved': return 'resolved';
      case 'closed': return 'closed';
      default: return 'open';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="ticket-management">
        <div className="ticket-header">
          <Skeleton variant="title" width="300px" />
          <Skeleton variant="button" />
        </div>
        
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-management">
      {/* Header */}
      <div className="ticket-header">
        <h1 className="ticket-title">Ticket Management</h1>
        <PrimaryButton>+ Create Ticket</PrimaryButton>
      </div>

      {/* Filters */}
      <div className="ticket-filters">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <Input
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-muted)40',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-content)'
            }}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Priority</label>
          <select 
            value={filters.urgency}
            onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-muted)40',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-content)'
            }}
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state-icon">🎫</div>
              <h3 className="empty-state-title">No tickets found</h3>
              <p className="empty-state-description">
                {filters.search || filters.status !== 'all' || filters.urgency !== 'all' 
                  ? 'Try adjusting your filters to see more tickets.'
                  : 'No tickets have been created yet.'}
              </p>
              <PrimaryButton>Create First Ticket</PrimaryButton>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="ticket-grid">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`ticket-card ticket-card--${getPriorityColor(ticket.urgency)}`}
              interactive
              onClick={() => handleTicketClick(ticket)}
            >
              <CardBody>
                <div className="ticket-header-row">
                  <div className="ticket-id">{ticket.ticketId}</div>
                  <div className={`ticket-status ticket-status--${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </div>
                </div>
                
                <h3 className="ticket-title-text">{ticket.title}</h3>
                
                <div className="ticket-meta">
                  <div className="ticket-meta-item">
                    <span className={`priority-indicator priority-indicator--${getPriorityColor(ticket.urgency)}`}></span>
                    {ticket.urgency}
                  </div>
                  <div className="ticket-meta-item">
                    👤 {ticket.name}
                  </div>
                  <div className="ticket-meta-item">
                    🏢 {ticket.department}
                  </div>
                  <div className="ticket-meta-item">
                    🕒 {formatTimestamp(ticket.timestamp)}
                  </div>
                </div>
                
                <div className="ticket-description">
                  {ticket.system} issue reported via {ticket.kioskId}
                </div>
                
                {ticket.tags && (
                  <div className="ticket-tags">
                    {ticket.tags.map((tag, index) => (
                      <span key={index} className="ticket-tag">#{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="ticket-actions">
                  <GhostButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(ticket.id, 'In Progress');
                    }}
                  >
                    Assign
                  </GhostButton>
                  <GhostButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(ticket.id, 'Resolved');
                    }}
                  >
                    Resolve
                  </GhostButton>
                  <PrimaryButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTicketClick(ticket);
                    }}
                  >
                    View Details
                  </PrimaryButton>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
      >
        <ModalHeader onClose={() => setShowModal(false)}>
          Ticket Details
        </ModalHeader>
        <ModalBody>
          {selectedTicket && (
            <div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <span className="ticket-id">{selectedTicket.ticketId}</span>
                  <span className={`ticket-status ticket-status--${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-xl)' }}>
                  {selectedTicket.title}
                </h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <strong>Requester:</strong><br />
                  {selectedTicket.name}<br />
                  {selectedTicket.email}
                </div>
                <div>
                  <strong>Department:</strong><br />
                  {selectedTicket.department}
                </div>
                <div>
                  <strong>Priority:</strong><br />
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={`priority-indicator priority-indicator--${getPriorityColor(selectedTicket.urgency)}`}></span>
                    {selectedTicket.urgency}
                  </span>
                </div>
                <div>
                  <strong>Created:</strong><br />
                  {formatTimestamp(selectedTicket.timestamp)}
                </div>
              </div>
              
              {selectedTicket.assignedTo && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <strong>Assigned to:</strong> {selectedTicket.assignedTo}
                </div>
              )}
              
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <strong>System:</strong> {selectedTicket.system}
              </div>
              
              {selectedTicket.resolution && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <strong>Resolution:</strong><br />
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-success)10', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                    {selectedTicket.resolution}
                  </div>
                </div>
              )}
              
              {selectedTicket.tags && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <strong>Tags:</strong><br />
                  <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                    {selectedTicket.tags.map((tag, index) => (
                      <span key={index} className="ticket-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <OutlineButton onClick={() => setShowModal(false)}>Close</OutlineButton>
          <PrimaryButton>Edit Ticket</PrimaryButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
