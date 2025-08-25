/**
 * Visitor Management Component for Nova Spaces
 * Enterprise visitor tracking and management system
 */

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Building,
  Shield,
  Camera,
  QrCode,
  Printer,
} from 'lucide-react';
import { Button } from '../../../../../../packages/design-system';
import { Card, CardBody, CardHeader } from '../../../../../../packages/design-system';
import './VisitorManagement.css';

interface VisitorManagementProps {
  buildingId?: string;
  onVisitorCheckin?: (visitorId: string) => void;
  onVisitorCheckout?: (visitorId: string) => void;
  className?: string;
}

interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  hostEmployeeId: string;
  hostName: string;
  purpose: string;
  scheduledArrival: string;
  scheduledDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'no_show' | 'cancelled';
  badgeNumber?: string;
  accessLevel: 'lobby' | 'floor' | 'restricted';
  photoUrl?: string;
  signatureUrl?: string;
  emergencyContact?: string;
  specialRequirements?: string;
  visitedSpaces?: string[];
}

export function VisitorManagement({
  buildingId = 'main-building',
  onVisitorCheckin,
  onVisitorCheckout,
  className,
}: VisitorManagementProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showNewVisitorForm, setShowNewVisitorForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - would come from API
  useEffect(() => {
    const mockVisitors: Visitor[] = [
      {
        id: 'vis-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0123',
        company: 'Acme Corp',
        hostEmployeeId: 'emp-001',
        hostName: 'Sarah Johnson',
        purpose: 'Client Meeting',
        scheduledArrival: '2024-01-20T10:00:00Z',
        scheduledDeparture: '2024-01-20T12:00:00Z',
        actualArrival: '2024-01-20T10:05:00Z',
        status: 'checked_in',
        badgeNumber: 'TEMP-001',
        accessLevel: 'floor',
        emergencyContact: 'Jane Smith +1-555-0124',
      },
      {
        id: 'vis-002',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@tech.com',
        company: 'Tech Solutions',
        hostEmployeeId: 'emp-002',
        hostName: 'Mike Chen',
        purpose: 'Technical Interview',
        scheduledArrival: '2024-01-20T14:00:00Z',
        scheduledDeparture: '2024-01-20T16:00:00Z',
        status: 'scheduled',
        accessLevel: 'lobby',
      },
      {
        id: 'vis-003',
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert@consulting.com',
        phone: '+1-555-0456',
        company: 'Wilson Consulting',
        hostEmployeeId: 'emp-003',
        hostName: 'Lisa Brown',
        purpose: 'Project Review',
        scheduledArrival: '2024-01-20T09:00:00Z',
        scheduledDeparture: '2024-01-20T11:00:00Z',
        actualArrival: '2024-01-20T09:00:00Z',
        actualDeparture: '2024-01-20T11:15:00Z',
        status: 'checked_out',
        badgeNumber: 'TEMP-002',
        accessLevel: 'restricted',
      },
    ];
    setVisitors(mockVisitors);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'checked_in':
        return 'status-checked-in';
      case 'checked_out':
        return 'status-checked-out';
      case 'no_show':
        return 'status-no-show';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="icon-sm" />;
      case 'checked_in':
        return <CheckCircle className="icon-sm" />;
      case 'checked_out':
        return <XCircle className="icon-sm" />;
      case 'no_show':
        return <AlertTriangle className="icon-sm" />;
      case 'cancelled':
        return <XCircle className="icon-sm" />;
      default:
        return <Clock className="icon-sm" />;
    }
  };

  const handleCheckin = async (visitor: Visitor) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitor.id
            ? {
                ...v,
                status: 'checked_in',
                actualArrival: new Date().toISOString(),
                badgeNumber: `TEMP-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
              }
            : v,
        ),
      );
      onVisitorCheckin?.(visitor.id);
    } catch (_error) {
      console.error('Check-in failed:', error);
    }
    setIsLoading(false);
  };

  const handleCheckout = async (visitor: Visitor) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitor.id
            ? {
                ...v,
                status: 'checked_out',
                actualDeparture: new Date().toISOString(),
              }
            : v,
        ),
      );
      onVisitorCheckout?.(visitor.id);
    } catch (_error) {
      console.error('Check-out failed:', error);
    }
    setIsLoading(false);
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch =
      searchTerm === '' ||
      visitor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const todaysVisitors = visitors.filter((v) => {
    const today = new Date().toDateString();
    const visitDate = new Date(v.scheduledArrival).toDateString();
    return today === visitDate;
  });

  const checkedInCount = visitors.filter((v) => v.status === 'checked_in').length;
  const scheduledCount = visitors.filter((v) => v.status === 'scheduled').length;
  const totalToday = todaysVisitors.length;

  return (
    <div className={`visitor-management ${className || ''}`}>
      {/* Header Stats */}
      <div className="visitor-stats">
        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Users className="stat-icon checked-in" />
              <div>
                <div className="stat-number">{checkedInCount}</div>
                <div className="stat-label">Currently In Building</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Calendar className="stat-icon scheduled" />
              <div>
                <div className="stat-number">{scheduledCount}</div>
                <div className="stat-label">Scheduled Today</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Building className="stat-icon total" />
              <div>
                <div className="stat-number">{totalToday}</div>
                <div className="stat-label">Total Visitors Today</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Controls */}
      <div className="visitor-controls">
        <div className="search-filters">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search visitors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="no_show">No Show</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="action-buttons">
          <Button
            variant="primary"
            onClick={() => setShowNewVisitorForm(true)}
            className="new-visitor-btn"
          >
            <UserPlus className="icon-sm" />
            Add Visitor
          </Button>
          <Button variant="outline">
            <Download className="icon-sm" />
            Export
          </Button>
        </div>
      </div>

      {/* Visitors List */}
      <Card className="visitors-list">
        <CardHeader>
          <h3>Visitors ({filteredVisitors.length})</h3>
        </CardHeader>
        <CardBody>
          {filteredVisitors.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <p>No visitors found</p>
            </div>
          ) : (
            <div className="visitor-table">
              <div className="table-header">
                <div>Visitor</div>
                <div>Company</div>
                <div>Host</div>
                <div>Purpose</div>
                <div>Scheduled</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {filteredVisitors.map((visitor) => (
                <div key={visitor.id} className="table-row">
                  <div className="visitor-info">
                    <div className="visitor-name">
                      {visitor.firstName} {visitor.lastName}
                    </div>
                    <div className="visitor-email">{visitor.email}</div>
                  </div>
                  <div className="visitor-company">{visitor.company || '-'}</div>
                  <div className="visitor-host">{visitor.hostName}</div>
                  <div className="visitor-purpose">{visitor.purpose}</div>
                  <div className="visitor-schedule">
                    <div>
                      {new Date(visitor.scheduledArrival).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {visitor.scheduledDeparture && (
                      <div className="departure-time">
                        -{' '}
                        {new Date(visitor.scheduledDeparture).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                  <div className={`visitor-status ${getStatusColor(visitor.status)}`}>
                    {getStatusIcon(visitor.status)}
                    {visitor.status.charAt(0).toUpperCase() +
                      visitor.status.slice(1).replace('_', ' ')}
                  </div>
                  <div className="visitor-actions">
                    {visitor.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleCheckin(visitor)} disabled={isLoading}>
                        Check In
                      </Button>
                    )}
                    {visitor.status === 'checked_in' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckout(visitor)}
                        disabled={isLoading}
                      >
                        Check Out
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelectedVisitor(visitor)}>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="modal-overlay" onClick={() => setSelectedVisitor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Card className="visitor-detail">
              <CardHeader>
                <h3>Visitor Details</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedVisitor(null)}>
                  ×
                </Button>
              </CardHeader>
              <CardBody>
                <div className="detail-sections">
                  <div className="detail-section">
                    <h4>Personal Information</h4>
                    <div className="detail-grid">
                      <div>
                        <label>Name:</label>
                        <span>
                          {selectedVisitor.firstName} {selectedVisitor.lastName}
                        </span>
                      </div>
                      <div>
                        <label>Email:</label>
                        <span>{selectedVisitor.email}</span>
                      </div>
                      {selectedVisitor.phone && (
                        <div>
                          <label>Phone:</label>
                          <span>{selectedVisitor.phone}</span>
                        </div>
                      )}
                      {selectedVisitor.company && (
                        <div>
                          <label>Company:</label>
                          <span>{selectedVisitor.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Visit Information</h4>
                    <div className="detail-grid">
                      <div>
                        <label>Host:</label>
                        <span>{selectedVisitor.hostName}</span>
                      </div>
                      <div>
                        <label>Purpose:</label>
                        <span>{selectedVisitor.purpose}</span>
                      </div>
                      <div>
                        <label>Access Level:</label>
                        <span className={`access-level ${selectedVisitor.accessLevel}`}>
                          <Shield className="icon-xs" />
                          {selectedVisitor.accessLevel.charAt(0).toUpperCase() +
                            selectedVisitor.accessLevel.slice(1)}
                        </span>
                      </div>
                      {selectedVisitor.badgeNumber && (
                        <div>
                          <label>Badge Number:</label>
                          <span>{selectedVisitor.badgeNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Timeline</h4>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-time">
                          {new Date(selectedVisitor.scheduledArrival).toLocaleString()}
                        </div>
                        <div className="timeline-event">Scheduled Arrival</div>
                      </div>
                      {selectedVisitor.actualArrival && (
                        <div className="timeline-item">
                          <div className="timeline-time">
                            {new Date(selectedVisitor.actualArrival).toLocaleString()}
                          </div>
                          <div className="timeline-event">Actual Arrival</div>
                        </div>
                      )}
                      {selectedVisitor.actualDeparture && (
                        <div className="timeline-item">
                          <div className="timeline-time">
                            {new Date(selectedVisitor.actualDeparture).toLocaleString()}
                          </div>
                          <div className="timeline-event">Actual Departure</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-actions">
                    <Button variant="outline">
                      <Mail className="icon-sm" />
                      Send Email
                    </Button>
                    <Button variant="outline">
                      <QrCode className="icon-sm" />
                      Generate QR Code
                    </Button>
                    <Button variant="outline">
                      <Printer className="icon-sm" />
                      Print Badge
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* New Visitor Form Modal */}
      {showNewVisitorForm && (
        <div className="modal-overlay" onClick={() => setShowNewVisitorForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <Card className="new-visitor-form">
              <CardHeader>
                <h3>Add New Visitor</h3>
                <Button variant="outline" size="sm" onClick={() => setShowNewVisitorForm(false)}>
                  ×
                </Button>
              </CardHeader>
              <CardBody>
                <form className="form-grid">
                  <div className="form-section">
                    <h4>Personal Information</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="firstName">First Name *</label>
                        <input type="text" id="firstName" required />
                      </div>
                      <div className="form-field">
                        <label htmlFor="lastName">Last Name *</label>
                        <input type="text" id="lastName" required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="email">Email *</label>
                        <input type="email" id="email" required />
                      </div>
                      <div className="form-field">
                        <label htmlFor="phone">Phone</label>
                        <input type="tel" id="phone" />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="company">Company</label>
                      <input type="text" id="company" />
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Visit Details</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="host">Host Employee *</label>
                        <select id="host" required>
                          <option value="">Select Host</option>
                          <option value="emp-001">Sarah Johnson</option>
                          <option value="emp-002">Mike Chen</option>
                          <option value="emp-003">Lisa Brown</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label htmlFor="accessLevel">Access Level *</label>
                        <select id="accessLevel" required>
                          <option value="lobby">Lobby Only</option>
                          <option value="floor">Floor Access</option>
                          <option value="restricted">Restricted Areas</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="purpose">Purpose of Visit *</label>
                      <input type="text" id="purpose" required />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="arrivalDate">Arrival Date *</label>
                        <input type="date" id="arrivalDate" required />
                      </div>
                      <div className="form-field">
                        <label htmlFor="arrivalTime">Arrival Time *</label>
                        <input type="time" id="arrivalTime" required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="departureDate">Departure Date</label>
                        <input type="date" id="departureDate" />
                      </div>
                      <div className="form-field">
                        <label htmlFor="departureTime">Departure Time</label>
                        <input type="time" id="departureTime" />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewVisitorForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Add Visitor
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
