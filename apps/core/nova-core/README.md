# Nova Core

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Open Issues](https://img.shields.io/github/issues/itristenx/nova-universe)](https://github.com/itristenx/nova-universe/issues)

---

## About

Modern, enterprise-grade admin interface for managing Nova Beacon kiosks, users, and support tickets. Part of the open source [Nova Universe](../README.md) platform.

---

## Features

- **Modern Tech Stack**: Built with React 18, TypeScript, Vite, and Tailwind CSS
- **Enterprise Architecture**: Scalable, maintainable, and type-safe codebase
- **Comprehensive Management**:
  - Dashboard with real-time statistics
  - Support ticket management with advanced filtering
  - Beacon kiosk monitoring and configuration
  - User management with role-based access control
  - Analytics and reporting
  - System notifications
  - Configurable settings and branding

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Heroicons
- **Forms**: React Hook Form (ready for implementation)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Nova Platform API server running

### Installation

1. Clone the repository and navigate to the core admin directory:

   ```bash
   cd nova-core
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Update the API URL in `.env` if needed:

   ```
   VITE_API_URL=http://localhost:3000
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  components/          # Reusable UI components
    ui/             # Basic UI components (Button, Input, etc.)
    layout/         # Layout components (Sidebar, Header, etc.)
  pages/              # Page components
  stores/             # Zustand state stores
  lib/                # Utilities and API client
  types/              # TypeScript type definitions
  main.tsx           # Application entry point
```

## Key Features

### Dashboard

- Real-time system statistics
- Recent ticket overview
- Beacon kiosk status monitoring
- Quick actions and navigation

### Ticket Management

- Comprehensive ticket listing with filtering
- Search by name, email, system, or title
- Filter by status, urgency, and date range
- Bulk operations and export capabilities

### Beacon Kiosk Management

- Real-time kiosk status monitoring
- Remote activation/deactivation
- Configuration management
- QR code generation for kiosk activation
- Status monitoring (open/closed/error)

### User Management

- User account creation and management
- Role-based access control (RBAC)
- Permission management
- User activity tracking

### Settings & Configuration

- System-wide configuration options
- Branding customization (logos, colors, messages)
- Security settings
- Notification preferences

## API Integration

The admin interface communicates with the Nova Platform API server through a centralized API client (`src/lib/api.ts`) that handles:

- Authentication with JWT tokens
- Request/response interceptors
- Error handling and retries
- Type-safe API calls

## Authentication

- JWT-based authentication
- Automatic token refresh
- Protected routes
- Role-based access control

## Community & Contributing

- [Contributing Guidelines](../.github/CONTRIBUTING.md)
- [Code of Conduct](../.github/CODE_OF_CONDUCT.md)
- [Security Policy](../.github/SECURITY.md)
- [Open an Issue](https://github.com/itristenx/nova-universe/issues)
- [Submit a Pull Request](https://github.com/itristenx/nova-universe/pulls)

---

## License

This project is licensed under the [MIT License](../LICENSE).

---

## Credits & Acknowledgments

- [othneildrew/Best-README-Template](https://github.com/othneildrew/Best-README-Template) for README inspiration
- All contributors and open source dependencies
