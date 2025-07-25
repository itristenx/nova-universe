# Feature Inventory Document

## Overview
This document provides a comprehensive inventory of features, modules, and submodules from the legacy Nova-Universe platform. It serves as a reference for ensuring feature parity in the new system.

---

## Core Modules

### Nova Core
- **System Configuration**: Tenant and system-wide settings.
- **Audit Trail**: Logs user actions, IPs, and metadata.
- **Workflow Engine**: Automations and approvals.
- **SLA Management**: Urgency x Impact matrix.

### Nova Helix
- **Identity Management**: SSO (SAML, OIDC), SCIM provisioning.
- **RBAC**: Role-based access control.
- **Session Control**: Secure session management.

### Nova Pulse
- **Technician Portal**: Unified dashboard for IT, HR, Ops, and Cybersecurity.
- **Submodules**:
  - **Pulse:IT**: Standard IT support.
  - **Pulse:HR**: HR case management.
  - **Pulse:Ops**: Facilities and logistics.
  - **Pulse:Cyber**: Cybersecurity incidents.

### Nova Orbit
- **End-User Portal**: Tickets, requests, and knowledge access.
- **Features**:
  - Public/private tickets.
  - Smart global search.
  - Cosmo assistant integration.

### Nova Lore
- **Knowledge Base**: Collaborative knowledge management.
- **Features**:
  - Article XP and impact metrics.
  - Verified solution tags.
  - AI-powered suggestions.

### Nova Synth
- **AI Engine**: Automation and workflows.
- **Features**:
  - Ticket classification.
  - Workflow state transitions.
  - Integration with Model Context Protocol (MCP).

---

## Legacy Features

### Ticket Management
- **Submission**: Via web, Slack, and kiosks.
- **Tracking**: Status, priority, and SLA compliance.
- **VIP Handling**: Priority queues and escalations.

### User Management
- **CRUD Operations**: Create, update, deactivate users.
- **SCIM Provisioning**: Automated user sync.
- **RBAC**: Role-based permissions.

### Integrations
- **Slack**: Slash commands and notifications.
- **ServiceNow**: Incident creation.
- **HelpScout**: Ticket synchronization.

### Knowledge Base
- **Public/Private Articles**: Role-based visibility.
- **Feedback and Ratings**: User engagement metrics.
- **AI Recommendations**: Contextual article suggestions.

---

## Planned Enhancements

### Advanced Features
- **Reporting and Analytics**: Usage metrics and insights.
- **Workflow Automation**: Custom triggers and actions.
- **Mobile App**: Technician and end-user interfaces.

### Third-Party Integrations
- **Slack and Teams**: Enhanced collaboration.
- **ServiceNow and HelpScout**: Remove ServiceNow integration and create and Import Only HelpScout intergration.

---

## References
- Legacy Codebase: `/nova-api/db-legacy.js`
- Documentation: `/docs/IMPLEMENTATION_PROGRESS.md`, `/project_docs/Project_Overview.txt`
