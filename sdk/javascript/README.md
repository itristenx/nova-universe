# Nova Universe JavaScript/TypeScript SDK

Official JavaScript and TypeScript client library for the Nova Universe Platform API V1.

## Installation

```bash
npm install @nova-universe/sdk
# or
yarn add @nova-universe/sdk
# or
pnpm add @nova-universe/sdk
```

## Quick Start

### TypeScript

```typescript
import { NovaClient } from '@nova-universe/sdk';

// Initialize client
const client = new NovaClient({
  baseUrl: 'http://localhost:3000',
});

// Authenticate
await client.authenticate('admin@example.com', 'admin');

// List tickets
const tickets = await client.tickets.list({
  status: 'open',
  limit: 50,
});

console.log(`Found ${tickets.length} open tickets`);

// Create a ticket
const ticket = await client.tickets.create({
  title: 'Network connectivity issue',
  description: 'Cannot access shared network drive',
  priority: 'high',
  category: 'network',
});

console.log(`Created ticket #${ticket.id}`);
```

### JavaScript (CommonJS)

```javascript
const { NovaClient } = require('@nova-universe/sdk');

const client = new NovaClient({
  baseUrl: 'http://localhost:3000',
});

// Use async/await
(async () => {
  await client.authenticate('admin@example.com', 'admin');
  const tickets = await client.tickets.list({ status: 'open' });
  console.log(tickets);
})();
```

### JavaScript (ES Modules)

```javascript
import { NovaClient } from '@nova-universe/sdk';

const client = new NovaClient({
  baseUrl: 'http://localhost:3000',
});

await client.authenticate('admin@example.com', 'admin');
const tickets = await client.tickets.list({ status: 'open' });
```

## Usage

### Authentication

#### Username/Password Authentication

```typescript
const client = new NovaClient({ baseUrl: 'http://localhost:3000' });

const authResponse = await client.authenticate(
  'admin@example.com',
  'admin'
);

console.log(`Authenticated as ${authResponse.user.email}`);
console.log(`Token: ${authResponse.token}`);
```

#### API Key Authentication

```typescript
const client = new NovaClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key-here',
});

// Already authenticated, can make requests immediately
const tickets = await client.tickets.list();
```

#### Manual Token Management

```typescript
const client = new NovaClient({ baseUrl: 'http://localhost:3000' });

// Set token manually
client.setAuthToken('your-jwt-token');

// Get current token
const token = client.getAuthToken();

// Clear authentication
client.clearAuth();
```

### Tickets

```typescript
// List tickets with filters
const tickets = await client.tickets.list({
  status: 'open',
  priority: 'high',
  search: 'network',
  page: 1,
  limit: 50,
  sort: 'priority',
  order: 'desc',
});

// Get specific ticket
const ticket = await client.tickets.get(123);

// Create ticket
const newTicket = await client.tickets.create({
  title: 'Printer not working',
  description: 'Office printer on 3rd floor is offline',
  priority: 'medium',
  category: 'hardware',
  requester_email: 'user@example.com',
});

// Update ticket
const updated = await client.tickets.update(123, {
  status: 'in_progress',
  priority: 'urgent',
  assigned_to: 5,
});

// Add comment
const comment = await client.tickets.addComment(
  123,
  'Investigating the issue',
  false // isPublic
);

// Delete ticket
await client.tickets.delete(123);
```

### Assets

```typescript
// List assets
const assets = await client.assets.list({ page: 1, limit: 50 });

// Get specific asset
const asset = await client.assets.get(456);

// Create asset
const newAsset = await client.assets.create({
  name: 'LAPTOP-001',
  type: 'laptop',
  serial_number: 'SN123456789',
  location: 'Office - Floor 3',
  assigned_to: 'user@example.com',
});

// Update asset
const updatedAsset = await client.assets.update(456, {
  location: 'Office - Floor 2',
  status: 'active',
});
```

### Users & Directory

```typescript
// List users
const users = await client.users.list({ page: 1, limit: 50 });

// Get specific user
const user = await client.users.get(789);

// Trigger directory sync
const syncResult = await client.users.sync();
```

### Monitoring & Alerts

```typescript
// Get monitoring dashboard
const dashboard = await client.monitoring.dashboard();

// Get system health
const health = await client.monitoring.health();
console.log(`System status: ${health.status}`);

// List alerts
const alerts = await client.monitoring.alerts('active');

// Create alert
const alert = await client.monitoring.createAlert({
  title: 'High CPU Usage',
  severity: 'warning',
  source: 'monitoring-system',
  description: 'CPU usage above 80%',
});

// Acknowledge alert
await client.monitoring.acknowledgeAlert(123);
```

### Workflows

```typescript
// List workflows
const workflows = await client.workflows.list();

// Get specific workflow
const workflow = await client.workflows.get(1);

// Create workflow
const newWorkflow = await client.workflows.create({
  name: 'Approval Workflow',
  description: 'Standard approval process',
  steps: [
    {
      type: 'approval',
      approvers: ['manager@example.com'],
    },
  ],
});
```

### Analytics

```typescript
// Get analytics dashboard
const analytics = await client.analytics.dashboard();

// Get ticket metrics
const metrics = await client.analytics.tickets('7d');
console.log(`Total tickets this week: ${metrics.total}`);
```

## Error Handling

The SDK provides typed exceptions for different error scenarios:

```typescript
import {
  NovaClient,
  AuthenticationError,
  ValidationError,
  ResourceNotFoundError,
  RateLimitError,
  NovaUniverseError,
} from '@nova-universe/sdk';

const client = new NovaClient({ baseUrl: 'http://localhost:3000' });

try {
  await client.authenticate('invalid@email.com', 'wrong-password');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  }
}

try {
  const ticket = await client.tickets.get(99999);
} catch (error) {
  if (error instanceof ResourceNotFoundError) {
    console.error('Ticket not found');
  }
}

try {
  await client.tickets.create({ title: '' }); // Missing required fields
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  }
}

try {
  // Make many requests rapidly
  for (let i = 0; i < 1000; i++) {
    await client.tickets.list();
  }
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  }
}

// Catch all SDK errors
try {
  await client.tickets.get(123);
} catch (error) {
  if (error instanceof NovaUniverseError) {
    console.error('API error:', error.message, 'Status:', error.statusCode);
  }
}
```

## Advanced Configuration

```typescript
import { NovaClient } from '@nova-universe/sdk';

const client = new NovaClient({
  baseUrl: 'https://api.nova-universe.com',
  apiVersion: 'v1', // API version (default: "v1")
  timeout: 60000, // Request timeout in milliseconds (default: 30000)
  apiKey: 'your-api-key',
});
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { NovaClient, Ticket, Asset, User } from '@nova-universe/sdk';

const client = new NovaClient({ baseUrl: 'http://localhost:3000' });

// Type-safe API calls
const tickets: Ticket[] = await client.tickets.list();
const asset: Asset = await client.assets.get(123);
const user: User = await client.users.get(456);

// Type-safe ticket creation
const newTicket: Ticket = await client.tickets.create({
  title: 'Network issue',
  description: 'Cannot connect',
  priority: 'high', // TypeScript will validate this value
});
```

## Convenience Functions

```typescript
import { createClient, createAuthenticatedClient } from '@nova-universe/sdk';

// Create client
const client = createClient({
  baseUrl: 'http://localhost:3000',
});

// Create and authenticate in one step
const authClient = await createAuthenticatedClient(
  'admin@example.com',
  'admin',
  { baseUrl: 'http://localhost:3000' }
);

// Already authenticated
const tickets = await authClient.tickets.list();
```

## Browser Usage

The SDK works in modern browsers with bundlers like Webpack, Vite, or Rollup:

```html
<script type="module">
  import { NovaClient } from '@nova-universe/sdk';

  const client = new NovaClient({
    baseUrl: 'http://localhost:3000',
  });

  await client.authenticate('admin@example.com', 'admin');
  const tickets = await client.tickets.list();
  console.log(tickets);
</script>
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

### Building

```bash
npm run build
```

This compiles TypeScript to JavaScript and generates type definitions in the `dist/` directory.

## Examples

See the `examples/` directory for more usage examples:

- `examples/basic-usage.ts` - Basic ticket operations
- `examples/monitoring.ts` - Monitoring and alerts
- `examples/workflows.ts` - Workflow automation
- `examples/error-handling.ts` - Error handling patterns

## API Documentation

For complete API documentation, visit:
- Local: http://localhost:3000/api-docs
- Production: https://api.nova-universe.com/api-docs

## Rate Limiting

The API implements rate limiting:
- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

The SDK does not automatically handle rate limiting. Implement retry logic in your application as needed.

## Support

- **Documentation**: https://docs.nova-universe.com
- **GitHub Issues**: https://github.com/itristenx/nova-universe/issues
- **Email**: api-support@nova-universe.com

## License

MIT License - See LICENSE file for details

## Changelog

### v1.0.0 (2025-10-05)
- Initial release
- Support for V1 API endpoints
- Full TypeScript support with type definitions
- Resources: Tickets, Assets, Users, Monitoring, Workflows, Analytics
- Authentication with username/password or API key
- Comprehensive error handling with typed exceptions
- Browser and Node.js support
