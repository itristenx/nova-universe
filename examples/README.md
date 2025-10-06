# Nova Universe Examples & Demos

This directory contains example code, demonstrations, and sample applications showcasing Nova Universe features.

## Directory Contents

### HTML Demos

- **`cosmo-demo.html`** - Interactive demo of Cosmo AI assistant
- **`workflow-approval-demo.html`** - Workflow approval system demonstration

### JavaScript Examples

- **`demo-enhanced-email-system.js`** - Enhanced email system demonstration
- **`examples-enhanced-email-system.js`** - Email system usage examples

### Shell Script Demos

- **`demo-tenant-management.sh`** - Multi-tenant management demonstration

## Usage

### Running HTML Demos

Open the HTML files in a web browser:

```bash
# From examples directory
open cosmo-demo.html
open workflow-approval-demo.html
```

Or serve them with a local web server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Then visit http://localhost:8000/cosmo-demo.html
```

### Running JavaScript Examples

```bash
# Email system demo
node examples/demo-enhanced-email-system.js

# Email system examples
node examples/examples-enhanced-email-system.js
```

### Running Shell Script Demos

```bash
# Tenant management demo
./examples/demo-tenant-management.sh
```

## Examples Overview

### Cosmo AI Assistant Demo

**File**: `cosmo-demo.html`

Interactive demonstration of the Cosmo AI assistant featuring:
- Natural language interaction
- Context-aware responses
- Knowledge base integration
- Ticket assistance

### Workflow Approval Demo

**File**: `workflow-approval-demo.html`

Demonstrates the workflow approval system:
- Multi-step approval processes
- Role-based permissions
- Status tracking
- Email notifications

### Enhanced Email System

**Files**: `demo-enhanced-email-system.js`, `examples-enhanced-email-system.js`

Examples showcasing the email system capabilities:
- Template rendering
- Attachment handling
- Queue management
- Delivery tracking
- Error handling

### Tenant Management

**File**: `demo-tenant-management.sh`

Demonstrates multi-tenancy features:
- Tenant creation and configuration
- Resource isolation
- Custom branding
- Data separation

## Creating New Examples

When adding new examples:

1. Use descriptive filenames indicating the feature demonstrated
2. Include inline comments explaining key concepts
3. Add usage instructions in this README
4. Ensure examples are self-contained and runnable
5. Use realistic but sanitized sample data

## Best Practices

- **Standalone**: Examples should run independently
- **Clear**: Include explanatory comments
- **Safe**: Use dummy data, never production credentials
- **Updated**: Keep examples in sync with current API
- **Documented**: Update this README when adding examples

## Related Documentation

- Main documentation: [`../docs/`](../docs/)
- API reference: [`../docs/API-QUICK-REFERENCE.md`](../docs/API-QUICK-REFERENCE.md)
- Guides: [`../docs/guides/`](../docs/guides/)

---

**Last Updated**: October 5, 2025  
**Organization Standard**: Industry Best Practices 2024-2025
