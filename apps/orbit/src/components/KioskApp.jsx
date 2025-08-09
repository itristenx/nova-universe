/**
 * Nova Universe Kiosk App - iPad Interface
 * Phase 3 Implementation - Real kiosk interface using design system
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, CardTitle, CardText, CardActions,
  Button, PrimaryButton, OutlineButton, GhostButton,
  Input, Label,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Toast,
  Progress, Spinner,
  useTheme
} from '../../packages/design-system';

const kioskAppStyles = `
.kiosk-app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-primary)05, var(--color-accent)05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.kiosk-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  padding: var(--space-6) var(--space-8);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.kiosk-logo {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-2) 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.kiosk-subtitle {
  font-size: var(--text-xl);
  font-weight: var(--font-light);
  margin: 0;
  opacity: 0.9;
}

.kiosk-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-8);
  overflow-y: auto;
}

.welcome-screen {
  text-align: center;
  padding: var(--space-12) var(--space-8);
}

.welcome-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0 0 var(--space-4) 0;
}

.welcome-subtitle {
  font-size: var(--text-xl);
  color: var(--color-muted);
  margin: 0 0 var(--space-8) 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

.service-card {
  background: var(--color-surface);
  border: 2px solid var(--color-muted)20;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  transition: all var(--duration-300) var(--ease-in-out);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-primary)05, var(--color-accent)05);
  opacity: 0;
  transition: opacity var(--duration-300) var(--ease-in-out);
}

.service-card:hover {
  border-color: var(--color-primary)60;
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.service-card:hover::before {
  opacity: 1;
}

.service-card:active {
  transform: translateY(-4px);
}

.service-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  position: relative;
  z-index: 1;
}

.service-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0 0 var(--space-2) 0;
  position: relative;
  z-index: 1;
}

.service-description {
  font-size: var(--text-lg);
  color: var(--color-muted);
  margin: 0 0 var(--space-6) 0;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

.service-button {
  position: relative;
  z-index: 1;
  font-size: var(--text-lg);
  padding: var(--space-4) var(--space-8);
}

.ticket-form {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
}

.form-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.form-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0 0 var(--space-2) 0;
}

.form-subtitle {
  font-size: var(--text-lg);
  color: var(--color-muted);
  margin: 0;
}

.form-section {
  margin-bottom: var(--space-8);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-content);
  margin: 0 0 var(--space-4) 0;
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-primary)20;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-content);
}

.form-input {
  font-size: var(--text-lg);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-muted)40;
  background-color: var(--color-background);
  color: var(--color-content);
  transition: border-color var(--duration-200) var(--ease-in-out);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary)20;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
}

.urgency-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.urgency-option {
  padding: var(--space-4);
  border: 2px solid var(--color-muted)40;
  border-radius: var(--radius-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-in-out);
  background-color: var(--color-background);
}

.urgency-option:hover {
  border-color: var(--color-primary)60;
}

.urgency-option.selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary)10;
}

.urgency-option.low {
  border-color: var(--color-success)60;
}

.urgency-option.low.selected {
  border-color: var(--color-success);
  background-color: var(--color-success)10;
}

.urgency-option.medium {
  border-color: var(--color-info)60;
}

.urgency-option.medium.selected {
  border-color: var(--color-info);
  background-color: var(--color-info)10;
}

.urgency-option.high {
  border-color: var(--color-warning)60;
}

.urgency-option.high.selected {
  border-color: var(--color-warning);
  background-color: var(--color-warning)10;
}

.urgency-option.critical {
  border-color: var(--color-error)60;
}

.urgency-option.critical.selected {
  border-color: var(--color-error);
  background-color: var(--color-error)10;
}

.urgency-label {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-1) 0;
}

.urgency-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.form-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-8);
}

.form-button {
  font-size: var(--text-xl);
  padding: var(--space-5) var(--space-12);
  min-width: 200px;
}

.success-screen {
  text-align: center;
  padding: var(--space-12) var(--space-8);
}

.success-icon {
  font-size: 6rem;
  color: var(--color-success);
  margin-bottom: var(--space-6);
}

.success-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0 0 var(--space-4) 0;
}

.success-message {
  font-size: var(--text-xl);
  color: var(--color-muted);
  margin: 0 0 var(--space-4) 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.ticket-number {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  background-color: var(--color-primary)10;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg);
  margin: var(--space-6) 0;
  display: inline-block;
}

.success-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-8);
}

.kiosk-footer {
  background-color: var(--color-surface);
  padding: var(--space-4) var(--space-8);
  border-top: 1px solid var(--color-muted)20;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.footer-actions {
  display: flex;
  gap: var(--space-3);
}

.timeout-warning {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  background-color: var(--color-warning);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

/* iPad specific optimizations */
@media (max-width: 1024px) {
  .service-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .urgency-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .service-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .success-actions {
    flex-direction: column;
    align-items: center;
  }
}

/* Touch-friendly interactions */
.service-card,
.urgency-option,
.form-button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .service-card {
    transition: none;
  }
  
  .service-card:hover {
    transform: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = kioskAppStyles;
  document.head.appendChild(styleElement);
}

const services = [
  {
    id: 'it-support',
    icon: '💻',
    title: 'IT Support',
    description: 'Computer problems, software issues, network connectivity, and technical assistance'
  },
  {
    id: 'facilities',
    icon: '🏢',
    title: 'Facilities',
    description: 'Building maintenance, room reservations, cleaning requests, and facility issues'
  },
  {
    id: 'hr-services',
    icon: '👥',
    title: 'HR Services',
    description: 'Employee services, benefits questions, policy inquiries, and HR assistance'
  },
  {
    id: 'visitor-services',
    icon: '🎯',
    title: 'Visitor Services',
    description: 'Guest registration, visitor badges, directions, and general assistance'
  },
  {
    id: 'security',
    icon: '🔒',
    title: 'Security',
    description: 'Security issues, access card problems, safety concerns, and emergency assistance'
  },
  {
    id: 'other',
    icon: '📝',
    title: 'Other Services',
    description: 'General inquiries, feedback, suggestions, and miscellaneous requests'
  }
];

const urgencyLevels = [
  {
    id: 'low',
    label: 'Low',
    description: 'Not urgent, can wait',
    class: 'low'
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Moderate priority',
    class: 'medium'
  },
  {
    id: 'high',
    label: 'High',
    description: 'Needs attention soon',
    class: 'high'
  },
  {
    id: 'critical',
    label: 'Critical',
    description: 'Urgent, immediate action',
    class: 'critical'
  }
];

export default function KioskApp() {
  const { colorMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, ticket-form, success
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    title: '',
    description: '',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Session timeout management
  useEffect(() => {
    let timeoutTimer;
    let warningTimer;

    const resetTimer = () => {
      clearTimeout(timeoutTimer);
      clearTimeout(warningTimer);
      setTimeLeft(300);
      setTimeoutWarning(false);

      // Show warning at 1 minute remaining
      warningTimer = setTimeout(() => {
        setTimeoutWarning(true);
        setTimeLeft(60);
      }, 240000); // 4 minutes

      // Reset to welcome screen after 5 minutes
      timeoutTimer = setTimeout(() => {
        setCurrentScreen('welcome');
        setSelectedService('');
        setFormData({
          name: '',
          email: '',
          department: '',
          title: '',
          description: '',
          urgency: 'medium'
        });
        setSubmittedTicket(null);
        setTimeoutWarning(false);
        setTimeLeft(300);
      }, 300000); // 5 minutes
    };

    // Start timer when not on welcome screen
    if (currentScreen !== 'welcome') {
      resetTimer();
    }

    // Reset timer on user interaction
    const handleUserActivity = () => {
      if (currentScreen !== 'welcome') {
        resetTimer();
      }
    };

    document.addEventListener('touchstart', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);

    return () => {
      clearTimeout(timeoutTimer);
      clearTimeout(warningTimer);
      document.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
    };
  }, [currentScreen]);

  // Countdown for warning
  useEffect(() => {
    let countdownTimer;
    if (timeoutWarning && timeLeft > 0) {
      countdownTimer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(countdownTimer);
  }, [timeoutWarning, timeLeft]);

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    setCurrentScreen('ticket-form');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate ticket number
    const ticketNumber = `NOV-${Date.now().toString().slice(-6)}`;
    
    setSubmittedTicket({
      number: ticketNumber,
      service: services.find(s => s.id === selectedService)?.title,
      ...formData
    });
    
    setIsSubmitting(false);
    setCurrentScreen('success');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
    setSelectedService('');
    setFormData({
      name: '',
      email: '',
      department: '',
      title: '',
      description: '',
      urgency: 'medium'
    });
    setSubmittedTicket(null);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="kiosk-app">
      {/* Timeout Warning */}
      {timeoutWarning && (
        <div className="timeout-warning">
          Session will expire in {timeLeft} seconds
        </div>
      )}

      {/* Header */}
      <div className="kiosk-header">
        <h1 className="kiosk-logo">Nova Universe</h1>
        <p className="kiosk-subtitle">Self-Service Help Desk</p>
      </div>

      {/* Main Content */}
      <div className="kiosk-main">
        {/* Welcome Screen */}
        {currentScreen === 'welcome' && (
          <div className="welcome-screen">
            <h2 className="welcome-title">Welcome! How can we help you today?</h2>
            <p className="welcome-subtitle">
              Select a service category below to submit a support request. 
              Our team will respond as quickly as possible.
            </p>
            
            <div className="service-grid">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="service-card"
                  onClick={() => handleServiceSelect(service.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${service.title} service: ${service.description}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleServiceSelect(service.id);
                    }
                  }}
                >
                  <div className="service-icon" aria-hidden="true">{service.icon}</div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                  <PrimaryButton className="service-button">
                    Select Service
                  </PrimaryButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket Form */}
        {currentScreen === 'ticket-form' && (
          <div className="ticket-form">
            <div className="form-header">
              <h2 className="form-title">
                Submit {services.find(s => s.id === selectedService)?.title} Request
              </h2>
              <p className="form-subtitle">
                Please provide the details below to help us assist you better
              </p>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Contact Information */}
              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="your.email@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-input form-select"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    >
                      <option value="">Select department</option>
                      <option value="IT">Information Technology</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Support">Customer Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="form-section">
                <h3 className="section-title">Request Details</h3>
                <div className="form-group">
                  <label className="form-label">Issue Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    className="form-input form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Please provide as much detail as possible about your issue..."
                  />
                </div>
              </div>

              {/* Urgency Level */}
              <div className="form-section">
                <h3 className="section-title">Urgency Level</h3>
                <div className="urgency-grid">
                  {urgencyLevels.map((level) => (
                    <div
                      key={level.id}
                      className={`urgency-option ${level.class} ${formData.urgency === level.id ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: level.id }))}
                    >
                      <div className="urgency-label">{level.label}</div>
                      <div className="urgency-description">{level.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <OutlineButton
                  type="button"
                  className="form-button"
                  onClick={handleBackToWelcome}
                  disabled={isSubmitting}
                >
                  Back
                </OutlineButton>
                <PrimaryButton
                  type="submit"
                  className="form-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" style={{ marginRight: 'var(--space-2)' }} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}

        {/* Success Screen */}
        {currentScreen === 'success' && submittedTicket && (
          <div className="success-screen">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Request Submitted Successfully!</h2>
            <p className="success-message">
              Your support request has been received and assigned a ticket number. 
              You will receive email updates about the progress of your request.
            </p>
            
            <div className="ticket-number">
              Ticket #{submittedTicket.number}
            </div>
            
            <p className="success-message">
              Expected response time: 
              {submittedTicket.urgency === 'critical' ? ' Within 1 hour' :
               submittedTicket.urgency === 'high' ? ' Within 4 hours' :
               submittedTicket.urgency === 'medium' ? ' Within 1 business day' :
               ' Within 3 business days'}
            </p>

            <div className="success-actions">
              <PrimaryButton
                className="form-button"
                onClick={handleBackToWelcome}
              >
                Submit Another Request
              </PrimaryButton>
              <OutlineButton
                className="form-button"
                onClick={() => window.print()}
              >
                Print Receipt
              </OutlineButton>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="kiosk-footer">
        <div className="footer-info">
          Kiosk ID: NOVA-KIOSK-001 • {getCurrentTime()}
        </div>
        <div className="footer-actions">
          <GhostButton size="sm">Help</GhostButton>
          <GhostButton size="sm">Accessibility</GhostButton>
          {currentScreen !== 'welcome' && (
            <OutlineButton size="sm" onClick={handleBackToWelcome}>
              Start Over
            </OutlineButton>
          )}
        </div>
      </div>
    </div>
  );
}
