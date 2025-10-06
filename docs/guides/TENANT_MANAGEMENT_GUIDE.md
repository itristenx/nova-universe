# Nova Universe Tenant Management Tool

This document describes the tenant creation tool for Nova SaaS admins, which allows them to create tenants and tenant admins through the Nova CLI.

## Overview

The tenant management CLI tool provides Nova SaaS administrators with the ability to:

- **Create new tenants** with customizable branding and configuration
- **Create tenant admin users** and assign them to specific tenants
- **List and manage existing tenants**
- **View detailed tenant information**

## Installation and Setup

The tenant management tool is integrated into the Nova CLI. No additional installation is required if you have Nova Universe set up.

### Prerequisites

- Nova Universe repository
- Node.js 18+ 
- PostgreSQL database with tenant schema
- Nova CLI dependencies installed

### Database Setup

The tool uses the existing PostgreSQL tenant schema with tables:
- `tenants` - Main tenant configuration
- `users` - User accounts with tenant association
- `user_roles` - Role assignments for tenant admins

## Commands

### 1. Create Tenant

Create a new tenant with branding and configuration options.

#### Interactive Mode (Default)
```bash
nova tenant create
```

#### Non-Interactive Mode
```bash
nova tenant create \
  --name "Acme Corporation" \
  --domain "acme.com" \
  --subdomain "acme" \
  --theme-color "#3b82f6" \
  --logo-url "https://acme.com/logo.png" \
  --support-email "support@acme.com"
```

#### Options
- `-n, --name <name>` - Tenant name (required)
- `-d, --domain <domain>` - Tenant domain (required)
- `-s, --subdomain <subdomain>` - Tenant subdomain (optional)
- `--theme-color <color>` - Theme color in hex format (default: #000000)
- `--logo-url <url>` - Logo URL (optional)
- `--support-email <email>` - Support email address (optional)
- `--interactive` - Interactive mode (default: true)

#### Example Output
```
✅ Tenant Details:
   ID: 550e8400-e29b-41d4-a716-446655440000
   Name: Acme Corporation
   Domain: acme.com
   Subdomain: acme
   Theme Color: #3b82f6
   Support Email: support@acme.com
   Status: Active
```

### 2. List Tenants

View all tenants in the system.

```bash
nova tenant list
```

#### Options
- `-j, --json` - Output in JSON format
- `--active` - Show only active tenants
- `--inactive` - Show only inactive tenants

#### Example Output
```
🏢 Tenants (3)

┌─────────────────────────┬──────────────────────────────┬────────────────────┬──────────┬────────────┐
│ Name                    │ Domain                       │ Subdomain          │ Status   │ Created    │
├─────────────────────────┼──────────────────────────────┼────────────────────┼──────────┼────────────┤
│ Acme Corporation        │ acme.com                     │ acme               │ 🟢 Active│ 2025-01-15 │
│ Beta Industries         │ beta.com                     │ beta               │ 🟢 Active│ 2025-01-14 │
│ Default Organization    │ localhost                    │ default            │ 🟢 Active│ 2025-01-01 │
└─────────────────────────┴──────────────────────────────┴────────────────────┴──────────┴────────────┘
```

### 3. Create Tenant Admin

Create an admin user for a specific tenant.

#### Interactive Mode (Default)
```bash
nova tenant create-admin acme.com
```

#### Non-Interactive Mode
```bash
nova tenant create-admin acme.com \
  --email "admin@acme.com" \
  --password "SecurePassword123!" \
  --name "John Smith"
```

#### Options
- `<tenantDomain>` - Tenant domain (required positional argument)
- `-e, --email <email>` - Admin email address (required)
- `-p, --password <password>` - Admin password (required)
- `-n, --name <name>` - Admin full name (required)
- `--interactive` - Interactive mode (default: true)

#### Example Output
```
✅ Tenant Admin Details:
   Name: John Smith
   Email: admin@acme.com
   Tenant: Acme Corporation (acme.com)
   Role: Admin
   Status: Active
```

### 4. View Tenant Information

Get detailed information about a specific tenant.

```bash
nova tenant info acme.com
```

#### Options
- `<domain>` - Tenant domain or subdomain (required)
- `-j, --json` - Output in JSON format

#### Example Output
```
🏢 Tenant Information

┌──────────────┬──────────────────────────────────────────────────────────┐
│ ID           │ 550e8400-e29b-41d4-a716-446655440000                     │
│ Name         │ Acme Corporation                                         │
│ Domain       │ acme.com                                                 │
│ Subdomain    │ acme                                                     │
│ Theme Color  │ #3b82f6                                                  │
│ Logo URL     │ https://acme.com/logo.png                                │
│ Support Email│ support@acme.com                                         │
│ SSO Enabled  │ No                                                       │
│ MFA Required │ No                                                       │
│ Status       │ 🟢 Active                                                │
│ Users        │ 5                                                        │
│ Admins       │ 2                                                        │
│ Created      │ 1/15/2025                                                │
│ Updated      │ 1/15/2025                                                │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### 5. Help

Get help for the tenant command or any subcommand.

```bash
nova tenant --help
nova tenant create --help
nova tenant create-admin --help
```

## Validation and Error Handling

The tenant management tool includes comprehensive validation:

### Tenant Creation Validation
- **Name**: Required, minimum 2 characters
- **Domain**: Required, valid domain format (e.g., company.com)
- **Subdomain**: Optional, alphanumeric and hyphens only
- **Email**: Valid email format when provided
- **Theme Color**: Valid hex color format (#RRGGBB)
- **Logo URL**: Valid URL format when provided

### Admin User Validation
- **Email**: Required, valid email format, must not already exist
- **Password**: Required, minimum 8 characters
- **Name**: Required
- **Tenant**: Must exist and be active

### Error Examples
```bash
# Invalid domain
❌ Failed to create tenant: Please enter a valid domain

# Existing tenant
❌ Failed to create tenant: Tenant with this domain already exists

# Invalid email
❌ Failed to create tenant admin: Please enter a valid email address

# Tenant not found
❌ Failed to create tenant admin: Tenant not found or inactive
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **Role-Based Access**: Tenant admins are assigned appropriate roles (admin role ID: 2)
- **Input Validation**: All inputs are validated and sanitized
- **Domain Verification**: Ensures unique domains and subdomains
- **Tenant Isolation**: Users are properly associated with their tenants

## Integration with Nova Universe

The tenant management tool integrates seamlessly with:

- **Universal Login System**: Tenants are automatically available for tenant discovery
- **User Management**: Created admin users appear in the user management system
- **Branding System**: Theme colors and logos are applied automatically
- **Authentication**: SSO and MFA settings are configurable per tenant

## Database Schema

The tool works with the existing Nova Universe tenant schema:

```sql
-- Main tenant table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  logo_url TEXT,
  theme_color VARCHAR(7) DEFAULT '#000000',
  background_image_url TEXT,
  support_email VARCHAR(255),
  sso_enabled BOOLEAN DEFAULT false,
  mfa_required BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users with tenant association
ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Role assignments
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   ❌ Failed to list tenants: No databases available. At least one database must be configured.
   ```
   **Solution**: Ensure PostgreSQL is running and environment variables are set:
   ```bash
   export POSTGRES_HOST=localhost
   export POSTGRES_DB=nova_universe
   export POSTGRES_USER=nova_admin
   export POSTGRES_PASSWORD=your_password
   ```

2. **Permission Errors**
   ```bash
   ❌ Failed to create tenant: permission denied for table tenants
   ```
   **Solution**: Ensure the database user has proper permissions on tenant tables.

3. **Missing Dependencies**
   ```bash
   ⚠️ Failed to load tenant command: Cannot find package 'cli-table3'
   ```
   **Solution**: Install CLI dependencies:
   ```bash
   cd apps/api && npm install
   ```

### Debug Mode

Enable debug logging:
```bash
DEBUG=true nova tenant create
```

## Examples and Use Cases

### Setting up a New Customer Tenant

1. **Create the tenant**:
   ```bash
   nova tenant create \
     --name "Customer Corp" \
     --domain "customer.com" \
     --subdomain "customer" \
     --theme-color "#2563eb" \
     --support-email "support@customer.com"
   ```

2. **Create the primary admin**:
   ```bash
   nova tenant create-admin customer.com \
     --email "admin@customer.com" \
     --name "Customer Admin" \
     --password "SecurePassword123!"
   ```

3. **Verify the setup**:
   ```bash
   nova tenant info customer.com
   ```

### Bulk Tenant Creation

For multiple tenants, you can script the creation:

```bash
#!/bin/bash
# create-tenants.sh

tenants=(
  "alpha.com:Alpha Corp:alpha"
  "beta.com:Beta Industries:beta"
  "gamma.com:Gamma Solutions:gamma"
)

for tenant in "${tenants[@]}"; do
  IFS=':' read -r domain name subdomain <<< "$tenant"
  
  echo "Creating tenant: $name"
  nova tenant create --name "$name" --domain "$domain" --subdomain "$subdomain"
  
  echo "Creating admin for: $domain"
  nova tenant create-admin "$domain" --email "admin@$domain" --name "$name Admin"
done
```

## API Integration

The tenant CLI tool creates tenants that are immediately available through:

- **Tenant Discovery API**: `/api/v1/helix/login/tenant/discover`
- **Universal Login**: Automatic tenant detection by domain/email
- **User Management API**: Admin users accessible through user endpoints

## Best Practices

1. **Domain Management**: Use consistent domain naming conventions
2. **Admin Creation**: Always create at least one admin user per tenant
3. **Security**: Use strong passwords and enable MFA when available
4. **Branding**: Provide logo URLs and theme colors for better user experience
5. **Testing**: Use the `nova tenant info` command to verify tenant setup

## Conclusion

The Nova Universe tenant management tool provides a complete solution for Nova SaaS administrators to efficiently create and manage tenants with their associated admin users. The tool follows Nova's existing patterns and integrates seamlessly with the universal login and user management systems.