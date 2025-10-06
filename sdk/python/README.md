# Nova Universe Python SDK

Official Python client library for the Nova Universe Platform API V1.

## Installation

```bash
pip install nova-universe-sdk
```

## Quick Start

```python
from nova_universe import NovaClient

# Initialize client
client = NovaClient(base_url="http://localhost:3000")

# Authenticate
client.authenticate("admin@example.com", "admin")

# Or use API key
client = NovaClient(
    base_url="http://localhost:3000",
    api_key="your-api-key"
)

# List tickets
tickets = client.tickets.list(status="open", limit=50)
print(f"Found {len(tickets)} open tickets")

# Create a ticket
ticket = client.tickets.create({
    "title": "Network connectivity issue",
    "description": "Cannot access shared network drive",
    "priority": "high",
    "category": "network"
})
print(f"Created ticket #{ticket['id']}")

# Update ticket
updated_ticket = client.tickets.update(ticket['id'], {
    "status": "in_progress",
    "assigned_to": 5
})

# Add comment
comment = client.tickets.add_comment(
    ticket['id'],
    "Working on resolving this issue",
    is_public=False
)
```

## Usage

### Authentication

#### Username/Password Authentication

```python
from nova_universe import NovaClient

client = NovaClient(base_url="http://localhost:3000")
auth_response = client.authenticate("admin@example.com", "admin")
print(f"Authenticated as {auth_response['user']['email']}")
```

#### API Key Authentication

```python
from nova_universe import NovaClient

client = NovaClient(
    base_url="http://localhost:3000",
    api_key="your-api-key-here"
)
```

### Tickets

```python
# List tickets with filters
tickets = client.tickets.list(
    status="open",
    priority="high",
    search="network",
    page=1,
    limit=50,
    sort="priority",
    order="desc"
)

# Get specific ticket
ticket = client.tickets.get(ticket_id=123)

# Create ticket
new_ticket = client.tickets.create({
    "title": "Printer not working",
    "description": "Office printer on 3rd floor is offline",
    "priority": "medium",
    "category": "hardware",
    "requester_email": "user@example.com"
})

# Update ticket
updated = client.tickets.update(123, {
    "status": "in_progress",
    "priority": "urgent",
    "assigned_to": 5
})

# Add comment
comment = client.tickets.add_comment(
    ticket_id=123,
    content="Investigating the issue",
    is_public=False
)

# Delete ticket
client.tickets.delete(ticket_id=123)
```

### Assets

```python
# List assets
assets = client.assets.list(page=1, limit=50)

# Get specific asset
asset = client.assets.get(asset_id=456)

# Create asset
new_asset = client.assets.create({
    "name": "LAPTOP-001",
    "type": "laptop",
    "serial_number": "SN123456789",
    "location": "Office - Floor 3",
    "assigned_to": "user@example.com"
})

# Update asset
updated_asset = client.assets.update(456, {
    "location": "Office - Floor 2",
    "status": "active"
})
```

### Users & Directory

```python
# List users
users = client.users.list(page=1, limit=50)

# Get specific user
user = client.users.get(user_id=789)

# Trigger directory sync
sync_result = client.users.sync()
```

### Monitoring & Alerts

```python
# Get monitoring dashboard
dashboard = client.monitoring.dashboard()

# Get system health
health = client.monitoring.health()
print(f"System status: {health['status']}")

# List alerts
alerts = client.monitoring.alerts(status="active")

# Create alert
alert = client.monitoring.create_alert({
    "title": "High CPU Usage",
    "severity": "warning",
    "source": "monitoring-system",
    "description": "CPU usage above 80%"
})

# Acknowledge alert
client.monitoring.acknowledge_alert(alert_id=123)
```

### Workflows

```python
# List workflows
workflows = client.workflows.list()

# Get specific workflow
workflow = client.workflows.get(workflow_id=1)

# Create workflow
new_workflow = client.workflows.create({
    "name": "Approval Workflow",
    "description": "Standard approval process",
    "steps": [
        {
            "type": "approval",
            "approvers": ["manager@example.com"]
        }
    ]
})
```

### Analytics

```python
# Get analytics dashboard
analytics = client.analytics.dashboard()

# Get ticket metrics
metrics = client.analytics.tickets(period="7d")
print(f"Total tickets this week: {metrics['total']}")
```

## Context Manager

Use the client as a context manager for automatic cleanup:

```python
from nova_universe import NovaClient

with NovaClient(base_url="http://localhost:3000") as client:
    client.authenticate("admin@example.com", "admin")
    tickets = client.tickets.list()
    # Client session will be closed automatically
```

## Error Handling

The SDK provides specific exceptions for different error types:

```python
from nova_universe import (
    NovaClient,
    AuthenticationError,
    ValidationError,
    ResourceNotFoundError,
    RateLimitError,
    NovaUniverseError
)

client = NovaClient(base_url="http://localhost:3000")

try:
    client.authenticate("invalid@email.com", "wrong-password")
except AuthenticationError as e:
    print(f"Authentication failed: {e}")

try:
    ticket = client.tickets.get(ticket_id=99999)
except ResourceNotFoundError as e:
    print(f"Ticket not found: {e}")

try:
    ticket = client.tickets.create({"title": ""})  # Missing required fields
except ValidationError as e:
    print(f"Validation error: {e}")

try:
    # Make many requests rapidly
    for i in range(1000):
        client.tickets.list()
except RateLimitError as e:
    print(f"Rate limit exceeded: {e}")

# Catch all SDK errors
try:
    client.tickets.get(ticket_id=123)
except NovaUniverseError as e:
    print(f"API error: {e}")
```

## Advanced Configuration

```python
from nova_universe import NovaClient

client = NovaClient(
    base_url="https://api.nova-universe.com",
    api_version="v1",  # API version (default: "v1")
    timeout=60,  # Request timeout in seconds (default: 30)
    api_key="your-api-key"
)
```

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe/sdk/python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e ".[dev]"
```

### Run Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black nova_universe/
```

### Type Checking

```bash
mypy nova_universe/
```

## Examples

See the `examples/` directory for more usage examples:

- `examples/basic_usage.py` - Basic ticket operations
- `examples/monitoring.py` - Monitoring and alerts
- `examples/workflows.py` - Workflow automation
- `examples/bulk_operations.py` - Bulk data operations

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
- Tickets, Assets, Users, Monitoring, Workflows, Analytics resources
- Authentication with username/password or API key
- Comprehensive error handling
- Type hints for better IDE support
