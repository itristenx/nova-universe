# CueIT macOS Portal

A native macOS application that provides a comprehensive interface for managing the CueIT helpdesk system. This app serves as a control center for all CueIT services and mirrors the functionality of the web-based admin portal.

## Features

### Service Management
- **Dashboard**: Overview of all running services with status indicators
- **Service Control**: Start/stop API server, admin UI, and Slack bot
- **Real-time Monitoring**: Live status monitoring of all CueIT services
- **Service Logs**: Real-time log viewing for debugging and monitoring

### Web Portal Integration
- **Seamless Navigation**: Direct links to all web portal sections
- **Quick Access**: One-click access to tickets, kiosks, users, analytics, and more
- **Native Experience**: Native macOS interface with modern SwiftUI design

### Portal Sections
- **Dashboard**: Service status and quick actions
- **Tickets**: Manage support tickets (opens web interface)
- **Kiosks**: Monitor and manage deployed kiosks (opens web interface)
- **Kiosk Management**: Generate QR codes and manage activations (opens web interface)
- **Users**: User and permissions management (opens web interface)
- **Analytics**: System analytics and reporting (opens web interface)
- **Notifications**: Manage system notifications (opens web interface)
- **Integrations**: Configure external service integrations (opens web interface)
- **Settings**: System configuration (opens web interface)
- **Services**: Native service management and monitoring

## Installation

1. Open the project in Xcode
2. Build and run the application
3. The app will automatically set up environment files on first launch
4. Click "Continue to CueIT Portal" to start using the application

## Configuration

### Environment Setup
The app automatically creates environment files for each service:
- `cueit-api/.env` - API server configuration
- `cueit-admin/.env` - Admin UI configuration  
- `cueit-slack/.env` - Slack bot configuration

### Default Configuration
Services are pre-configured with sensible defaults for local development:
- API Server: http://localhost:3000
- Admin UI: http://localhost:5173
- Slack Bot: http://localhost:3001

## Usage

### Starting Services
1. Open the CueIT macOS Portal
2. Navigate to the "Services" section or use the Dashboard
3. Select which services to start (API and Admin are recommended)
4. Click "Start Services"
5. Monitor the status in the Dashboard or Services view

### Accessing Web Features
- Use the sidebar to navigate to different sections
- Most sections will open the corresponding web interface
- The Dashboard and Services sections provide native macOS functionality

### Monitoring
- Dashboard shows real-time service status
- Services view provides detailed logs and control
- Status indicators update automatically every 5 seconds

## Architecture

The app is built with SwiftUI and follows modern macOS design patterns:
- **CueITApp**: Main application entry point
- **CueITAppModel**: Central state management and service coordination
- **ContentView**: Main navigation and view coordination
- **SidebarView**: Navigation sidebar with all portal sections
- **ServiceViews**: Individual views for each portal section
- **SetupView**: Initial configuration and onboarding

## Development

### Requirements
- macOS 12.0 or later
- Xcode 14.0 or later
- Swift 5.7 or later

### Building
1. Clone the repository
2. Open `CueIT.xcodeproj` in Xcode
3. Build and run

### Testing
The app expects the CueIT services to be available in sibling directories:
```
CueIT/
├── cueit-macos/          # This app
├── cueit-api/            # API server
├── cueit-admin/          # Admin UI
└── cueit-slack/          # Slack bot
```

## Command Line

`launch_services.sh` is provided to start the Node services from a terminal without opening the GUI.

## Features Overview

- ✅ Native macOS interface with sidebar navigation
- ✅ Real-time service status monitoring
- ✅ Integrated service management (start/stop/logs)
- ✅ Direct web portal integration
- ✅ Automatic environment setup
- ✅ Modern SwiftUI design
- ✅ One-click access to all CueIT features

This app serves as the central hub for managing your CueIT helpdesk system on macOS, providing both native controls and seamless access to the full web-based feature set.
