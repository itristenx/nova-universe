# Nova Universe - Unified ITSM Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.4-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.11-06B6D4)](https://tailwindcss.com)

The unified Nova Universe application consolidates Core (admin portal), Pulse (technician portal), and Orbit (end-user portal) into a single, role-based ITSM platform following industry standards like ServiceNow, FreshDesk, and ZenDesk.

## 🌟 Features

### 🔐 Unified Authentication
- **Nova Helix Integration**: Seamless SSO with existing authentication system
- **Role-Based Access Control**: Granular permissions and multi-role support
- **Multi-Factor Authentication**: Enterprise-grade security
- **Session Management**: Secure token handling and refresh

### 🎯 Module Integration
- **Nova Core (Admin)**: System administration and configuration
- **Nova Pulse (Technician)**: Service desk and field operations
- **Nova Orbit (End-User)**: Self-service portal and ticket submission
- **Nova Lore (Knowledge)**: Integrated knowledge base
- **Nova Beacon (Kiosk)**: Mobile-optimized kiosk interface
- **Nova Synth (Analytics)**: AI-powered insights and reporting

### 📱 Progressive Web App (PWA)
- **Offline Capability**: Service workers for offline functionality
- **Mobile Optimized**: Touch-friendly interface for technicians
- **Install Prompts**: Native app-like experience
- **Push Notifications**: Real-time updates for ticket changes
- **File Handling**: Direct integration with device file systems

### 🎨 Apple-Inspired Design
- **Glass Morphism**: Modern, translucent design elements
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Responsive Layout**: Adaptive design for all screen sizes
- **Dark Mode Support**: System-aware theme switching
- **Accessibility**: WCAG 2.2 AA compliant

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with design tokens
- **UI Components**: Radix UI + HeroUI + Custom components
- **State Management**: Zustand + React Query
- **Authentication**: Nova Helix API integration
- **Build Tool**: Turbopack for development, SWC for production

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page with role-based routing
│   ├── login/             # Authentication pages
│   ├── admin/             # Core admin module
│   ├── pulse/             # Technician module
│   ├── portal/            # End-user module
│   ├── knowledge/         # Knowledge base module
│   ├── kiosk/             # Beacon kiosk module
│   └── analytics/         # Synth analytics module
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (ShadCN)
│   ├── layout/           # Layout components
│   └── modules/          # Module-specific components
├── lib/                  # Utilities and configurations
│   ├── auth/             # Authentication logic
│   ├── api/              # API client configurations
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── store/                # State management
└── styles/               # Global styles and themes
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+ or yarn
- Nova Platform API server running

### Installation

1. **Clone and navigate to the unified app:**
   ```bash
   cd apps/nova-universe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment:**
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_AUTH_URL=http://localhost:3000/api/v1/helix
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3001`

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Analyze bundle size
npm run analyze
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | Nova Core API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_AUTH_URL` | Nova Helix Auth URL | `http://localhost:3000/api/v1/helix` |
| `NEXT_PUBLIC_MODULE_*_ENABLED` | Module feature flags | `true` |
| `NEXT_PUBLIC_PWA_ENABLED` | Enable PWA features | `true` |

### Module Configuration

Each module can be independently enabled/disabled through environment variables:

```env
NEXT_PUBLIC_MODULE_CORE_ENABLED=true
NEXT_PUBLIC_MODULE_PULSE_ENABLED=true
NEXT_PUBLIC_MODULE_ORBIT_ENABLED=true
NEXT_PUBLIC_MODULE_BEACON_ENABLED=true
NEXT_PUBLIC_MODULE_LORE_ENABLED=true
NEXT_PUBLIC_MODULE_SYNTH_ENABLED=true
```

### Role-Based Access Control

The application supports the following user roles:

- **`super_admin`**: Full system access
- **`admin`**: Administrative access to Core module
- **`tech_lead`**: Advanced technician access in Pulse
- **`tech`**: Standard technician access in Pulse
- **`end_user`**: Self-service access in Orbit
- **`guest`**: Limited read-only access

## 🎨 Theming & Design System

### Design Tokens

The application uses a comprehensive design system with:

- **Colors**: Nova brand palette with semantic variants
- **Typography**: Inter font family with proper scaling
- **Spacing**: Consistent 8px grid system
- **Shadows**: Glass morphism and depth effects
- **Animations**: Smooth transitions and micro-interactions

### Customization

Modify design tokens in:
- `tailwind.config.js` - Tailwind configuration
- `src/styles/globals.css` - CSS custom properties
- Theme switching via `next-themes`

## 📱 PWA Features

### Offline Support
- Service worker caches critical resources
- Offline fallback pages
- Background sync for form submissions

### Mobile Experience
- Touch-optimized interactions
- Swipe gestures for navigation
- Pull-to-refresh functionality
- Native app installation prompts

### File Handling
- Direct file imports for tickets
- Photo capture for mobile reports
- Document sharing integration

## 🔒 Security

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure session management
- Role-based route protection

### Data Protection
- Input validation and sanitization
- XSS protection with DOMPurify
- CSRF protection
- Secure headers configuration

### Privacy
- GDPR compliance ready
- Data retention policies
- Audit logging
- User consent management

## 🧪 Testing

### Test Structure
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Types
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and workflow testing
- **E2E Tests**: Full user journey testing
- **Accessibility Tests**: WCAG compliance testing

## 📦 Deployment

### Docker Deployment

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3001
CMD ["node", "server.js"]
```

### Environment Setup

1. **Development**: Full debugging and hot reload
2. **Staging**: Production build with development features
3. **Production**: Optimized build with monitoring

### Performance Optimization

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Static asset and API response caching

## 🔗 Integration

### Nova Helix Authentication
```typescript
// Automatic integration with existing auth system
const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  endpoints: {
    login: '/login/authenticate',
    refresh: '/token/refresh',
    profile: '/me'
  }
}
```

### Nova Core API
```typescript
// Seamless API integration
const apiClient = new NovaApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  modules: ['core', 'pulse', 'orbit', 'lore', 'synth']
})
```

## 📊 Analytics & Monitoring

### Performance Monitoring
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Error boundary reporting
- API response time tracking

### User Analytics
- Feature usage tracking
- User journey analysis
- A/B testing support
- Conversion funnel analysis

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and type checking
4. Submit pull request with description
5. Code review and approval process

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commit messages
- Component documentation

## 📚 Documentation

### Additional Resources
- [API Documentation](./docs/api.md)
- [Component Storybook](./docs/storybook.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🆘 Support

### Getting Help
- **Documentation**: Check the docs folder
- **Issues**: GitHub issue tracker
- **Discussions**: Team communication channels
- **Support**: IT Support portal

### Known Issues
- Service worker may need manual clearing during development
- Mobile Safari requires specific PWA configuration
- IE11 not supported (modern browsers only)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Nova Universe** - Building the future of enterprise IT service management.

© 2024 Nova Universe Team. All rights reserved.