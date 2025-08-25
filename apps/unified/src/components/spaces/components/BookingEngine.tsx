/**
 * Advanced Booking Engine Component for Nova Spaces
 * Enterprise-grade space booking with conflict detection and calendar integration
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  User,
  Coffee,
  Wifi,
  Projector,
  Car,
} from 'lucide-react';
import { Button } from '../../../../../../packages/design-system';
import { Card, CardHeader, CardBody, CardTitle } from '../../../../../../packages/design-system';
import './BookingEngine.css';

interface BookingEngineProps {
  spaceId?: string;
  onBookingCreated?: (booking: SpaceBooking) => void;
  onBookingUpdated?: (booking: SpaceBooking) => void;
  onBookingDeleted?: (bookingId: string) => void;
  className?: string;
}

interface SpaceBooking {
  id: string;
  spaceId: string;
  spaceName: string;
  title: string;
  description?: string;
  attendeeCount: number;
  startTime: Date;
  endTime: Date;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  attendees: Array<{
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  status: 'confirmed' | 'tentative' | 'cancelled';
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  amenities: string[];
  notes?: string;
}

interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number;
  amenities: string[];
  building: string;
  floor: string;
  hourlyRate?: number;
}

export function BookingEngine({
  spaceId,
  onBookingCreated,
  onBookingUpdated,
  onBookingDeleted,
  className,
}: BookingEngineProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<SpaceBooking | null>(null);
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);
  const [availableSpaces, setAvailableSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attendeeCount: 1,
    startTime: '',
    endTime: '',
    attendees: [] as string[],
    amenities: [] as string[],
    notes: '',
    recurring: false,
    frequency: 'weekly' as const,
    interval: 1,
    endDate: '',
  });

  // Mock data - would come from API
  const mockSpaces: Space[] = [
    {
      id: 'space-001',
      name: 'Conference Room A',
      type: 'conference_room',
      capacity: 8,
      amenities: ['projector', 'wifi', 'whiteboard'],
      building: 'Main',
      floor: '1st',
      hourlyRate: 50,
    },
    {
      id: 'space-002',
      name: 'Focus Room 1',
      type: 'focus_room',
      capacity: 2,
      amenities: ['wifi', 'privacy'],
      building: 'Main',
      floor: '2nd',
      hourlyRate: 25,
    },
    {
      id: 'space-003',
      name: 'Hot Desk 5',
      type: 'hot_desk',
      capacity: 1,
      amenities: ['wifi', 'monitor'],
      building: 'North',
      floor: '1st',
      hourlyRate: 15,
    },
  ];

  const mockBookings: SpaceBooking[] = [
    {
      id: 'booking-001',
      spaceId: 'space-001',
      spaceName: 'Conference Room A',
      title: 'Team Standup',
      attendeeCount: 6,
      startTime: new Date(2024, 0, 15, 9, 0),
      endTime: new Date(2024, 0, 15, 10, 0),
      organizer: { id: 'user-1', name: 'John Doe', email: 'john@company.com' },
      attendees: [],
      status: 'confirmed',
      amenities: ['projector', 'wifi'],
      notes: 'Weekly team standup meeting',
    },
  ];

  const timeSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
  ];

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'projector', label: 'Projector', icon: Projector },
    { id: 'coffee', label: 'Coffee', icon: Coffee },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'whiteboard', label: 'Whiteboard', icon: Edit },
  ];

  useEffect(() => {
    // Initialize with mock data
    setBookings(mockBookings);
    setAvailableSpaces(mockSpaces);
    if (spaceId) {
      const space = mockSpaces.find((s) => s.id === spaceId);
      setSelectedSpace(space || null);
    }
  }, [spaceId]);

  const isTimeSlotAvailable = (timeSlot: string, space: Space): boolean => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // 30 minutes

    return !bookings.some(
      (booking) =>
        booking.spaceId === space.id &&
        booking.status !== 'cancelled' &&
        ((slotStart >= booking.startTime && slotStart < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
          (slotStart <= booking.startTime && slotEnd >= booking.endTime)),
    );
  };

  const handleBookSpace = (space: Space, timeSlot: string) => {
    setSelectedSpace(space);
    setSelectedTimeSlot(timeSlot);
    setShowBookingForm(true);

    // Pre-fill form with selected time
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour default

    setFormData({
      ...formData,
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
    });
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;

    const startDateTime = new Date(selectedDate);
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(selectedDate);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const newBooking: SpaceBooking = {
      id: `booking-${Date.now()}`,
      spaceId: selectedSpace.id,
      spaceName: selectedSpace.name,
      title: formData.title,
      description: formData.description,
      attendeeCount: formData.attendeeCount,
      startTime: startDateTime,
      endTime: endDateTime,
      organizer: { id: 'current-user', name: 'Current User', email: 'user@company.com' },
      attendees: [],
      status: 'confirmed',
      amenities: formData.amenities,
      notes: formData.notes,
    };

    if (editingBooking) {
      const updatedBookings = bookings.map((b) =>
        b.id === editingBooking.id ? { ...newBooking, id: editingBooking.id } : b,
      );
      setBookings(updatedBookings);
      onBookingUpdated?.(newBooking);
    } else {
      setBookings([...bookings, newBooking]);
      onBookingCreated?.(newBooking);
    }

    // Reset form
    setShowBookingForm(false);
    setEditingBooking(null);
    setFormData({
      title: '',
      description: '',
      attendeeCount: 1,
      startTime: '',
      endTime: '',
      attendees: [],
      amenities: [],
      notes: '',
      recurring: false,
      frequency: 'weekly',
      interval: 1,
      endDate: '',
    });
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(bookings.filter((b) => b.id !== bookingId));
    onBookingDeleted?.(bookingId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredSpaces = availableSpaces.filter((space) => {
    const matchesSearch =
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAmenities =
      filterAmenities.length === 0 ||
      filterAmenities.every((amenity) => space.amenities.includes(amenity));
    return matchesSearch && matchesAmenities;
  });

  const todayBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className={`booking-engine ${className || ''}`}>
      {/* Header */}
      <div className="booking-header">
        <div className="header-content">
          <h2>Space Booking</h2>
          <p>Book meeting rooms, desks, and collaboration spaces</p>
        </div>
        <div className="header-actions">
          <Button onClick={() => setShowBookingForm(true)}>
            <Plus className="icon-sm" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card className="date-navigation">
        <CardBody>
          <div className="date-nav-container">
            <div className="date-controls">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))
                }
              >
                <ChevronLeft className="icon-sm" />
              </Button>
              <h3 className="selected-date">{formatDate(selectedDate)}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))
                }
              >
                <ChevronRight className="icon-sm" />
              </Button>
            </div>
            <div className="view-controls">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Space Search and Filters */}
      <Card className="space-filters">
        <CardBody>
          <div className="filter-container">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="amenity-filters">
              {amenityOptions.map((amenity) => (
                <Button
                  key={amenity.id}
                  variant={filterAmenities.includes(amenity.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (filterAmenities.includes(amenity.id)) {
                      setFilterAmenities(filterAmenities.filter((a) => a !== amenity.id));
                    } else {
                      setFilterAmenities([...filterAmenities, amenity.id]);
                    }
                  }}
                >
                  <amenity.icon className="icon-sm" />
                  {amenity.label}
                </Button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Booking Grid */}
      <div className="booking-grid">
        {/* Time Column */}
        <div className="time-column">
          <div className="time-header">Time</div>
          {timeSlots.map((slot) => (
            <div key={slot} className="time-slot">
              {slot}
            </div>
          ))}
        </div>

        {/* Space Columns */}
        {filteredSpaces.map((space) => (
          <div key={space.id} className="space-column">
            <div className="space-header">
              <div className="space-info">
                <h4>{space.name}</h4>
                <div className="space-details">
                  <span>
                    <Users className="icon-xs" /> {space.capacity}
                  </span>
                  <span>
                    <MapPin className="icon-xs" /> {space.building} {space.floor}
                  </span>
                </div>
              </div>
            </div>

            {timeSlots.map((slot) => {
              const isAvailable = isTimeSlotAvailable(slot, space);
              const booking = todayBookings.find((b) => {
                const bookingStart = new Date(b.startTime);
                const [slotHours, slotMinutes] = slot.split(':').map(Number);
                return (
                  b.spaceId === space.id &&
                  bookingStart.getHours() === slotHours &&
                  bookingStart.getMinutes() === slotMinutes
                );
              });

              return (
                <div
                  key={`${space.id}-${slot}`}
                  className={`booking-slot ${isAvailable ? 'available' : 'occupied'} ${booking ? 'has-booking' : ''}`}
                  onClick={() => isAvailable && handleBookSpace(space, slot)}
                >
                  {booking ? (
                    <div className="booking-info">
                      <div className="booking-title">{booking.title}</div>
                      <div className="booking-attendees">
                        <Users className="icon-xs" />
                        {booking.attendeeCount}
                      </div>
                      <div className="booking-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBooking(booking);
                            setShowBookingForm(true);
                          }}
                        >
                          <Edit className="icon-xs" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBooking(booking.id);
                          }}
                        >
                          <Trash2 className="icon-xs" />
                        </Button>
                      </div>
                    </div>
                  ) : isAvailable ? (
                    <div className="available-slot">
                      <Plus className="icon-sm" />
                      <span>Book</span>
                    </div>
                  ) : (
                    <div className="occupied-slot">
                      <AlertCircle className="icon-sm" />
                      <span>Unavailable</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSubmitBooking} className="booking-form">
              <div className="form-header">
                <h3>{editingBooking ? 'Edit Booking' : 'New Booking'}</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBookingForm(false);
                    setEditingBooking(null);
                  }}
                >
                  ×
                </Button>
              </div>

              <div className="form-body">
                <div className="form-group">
                  <label htmlFor="booking-title">Title *</label>
                  <input
                    id="booking-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="form-input"
                    placeholder="Meeting title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="booking-description">Description</label>
                  <textarea
                    id="booking-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Meeting description"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start-time">Start Time *</label>
                    <input
                      id="start-time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="end-time">End Time *</label>
                    <input
                      id="end-time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="attendee-count">Attendee Count *</label>
                  <input
                    id="attendee-count"
                    type="number"
                    min="1"
                    max={selectedSpace?.capacity || 50}
                    value={formData.attendeeCount}
                    onChange={(e) =>
                      setFormData({ ...formData, attendeeCount: parseInt(e.target.value) })
                    }
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Required Amenities</label>
                  <div className="amenity-checkboxes">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                amenities: [...formData.amenities, amenity.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                amenities: formData.amenities.filter((a) => a !== amenity.id),
                              });
                            }
                          }}
                        />
                        <amenity.icon className="icon-sm" />
                        {amenity.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="booking-notes">Notes</label>
                  <textarea
                    id="booking-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="form-textarea"
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
              </div>

              <div className="form-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBookingForm(false);
                    setEditingBooking(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBooking ? 'Update Booking' : 'Create Booking'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
