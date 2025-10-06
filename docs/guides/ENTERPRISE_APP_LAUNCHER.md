# Enterprise App Launcher

A simple enterprise application launcher for Nova Universe that allows administrators to add custom external applications via URLs. All applications open in new browser windows and integrate with Nova's authentication and tracking systems.

## Features

- **Admin Interface**: Simple form-based UI for adding and managing custom applications
- **URL-Based Apps**: Support for any web application accessible via URL
- **New Window Launch**: All applications automatically open in new browser windows for security
- **Nova DB Integration**: Uses only Nova database and Helix authentication (no direct Okta dependencies)
- **Usage Tracking**: Tracks application launches for analytics
- **Security**: URL validation and XSS prevention
- **Branding**: Custom colors and icons for each application

## Access

- **URL**: `/admin/app-launcher`
- **Permissions**: Admin role required
- **Authentication**: Nova Helix integration

## Usage

### Adding an Application

1. Navigate to `/admin/app-launcher` in Nova
2. Click "Add Application" button
3. Fill out the form:
   - **Application Name**: Display name (e.g., "Salesforce")
   - **Description**: Brief description of the application
   - **Application URL**: Full URL (e.g., "https://company.salesforce.com")
   - **Icon URL**: Optional icon image URL
   - **App Color**: Choose from preset colors for branding

4. Click "Create Application"

### Managing Applications

- **Edit**: Click the pencil icon on any application card
- **Delete**: Click the trash icon and confirm deletion
- **Launch**: Click "Launch App" to test the application

### Launching Applications

When users launch an application:
- Opens in a new browser window/tab
- Includes security flags (`noopener,noreferrer`)
- Usage is tracked for analytics
- Works with any web-based application

## Technical Implementation

### Database Schema

Applications are stored in the existing `applications` table with:
- `app_type`: Set to 'external' for URL-based apps
- `url`: The target application URL
- `launch_config`: Configuration for new window behavior
- `external_config.open_in_new_window`: Always true for security

### API Endpoints

- `GET /api/v1/app-switcher/apps` - List all applications (admin)
- `POST /api/v1/app-switcher/apps` - Create new application (admin)
- `PUT /api/v1/app-switcher/apps/:id` - Update application (admin)
- `DELETE /api/v1/app-switcher/apps/:id` - Delete application (admin)
- `POST /api/v1/app-switcher/track-usage` - Track application usage

### Security

- **URL Validation**: Only `http://` and `https://` URLs allowed
- **XSS Prevention**: Blocks `javascript:`, `data:`, and other dangerous protocols
- **Admin Only**: Requires admin role for management
- **New Window**: Applications always open in new windows with security flags
- **Nova Authentication**: Uses Nova Helix for all authentication

### Integration

- **Frontend**: React component at `apps/unified/src/pages/admin/EnterpriseAppLauncher.tsx`
- **Service**: TypeScript service at `apps/unified/src/services/enhancedAppSwitcher.ts`
- **Backend**: Node.js API at `apps/api/routes/app-switcher.js`
- **Database**: PostgreSQL with existing app switcher schema

## Examples

### Common Enterprise Applications

```javascript
// Salesforce CRM
{
  name: "Salesforce",
  description: "Customer relationship management platform",
  url: "https://company.salesforce.com",
  color: "#00A1E0"
}

// Microsoft 365
{
  name: "Microsoft 365",
  description: "Office applications and collaboration tools",
  url: "https://portal.office.com",
  color: "#0078D4"
}

// Jira
{
  name: "Jira",
  description: "Project management and issue tracking",
  url: "https://company.atlassian.net",
  color: "#0052CC"
}
```

## Testing

Run the test suite to verify functionality:

```bash
npm test test/enterprise-app-launcher.test.js
npm test test/system-verification.test.js
```

## Troubleshooting

### Application Won't Launch
- Verify the URL is accessible and valid
- Check that the application supports being opened in new windows
- Ensure the URL uses `https://` for security

### Can't Add Applications
- Verify admin permissions in Nova Helix
- Check that the API is running and accessible
- Validate the URL format

### Applications Not Appearing
- Check the application's `is_active` status in the database
- Verify the user has appropriate assignments
- Check for console errors in the browser

## Future Enhancements

- User-specific application assignments
- Category organization
- Application usage analytics dashboard
- Icon upload functionality
- Bulk application import
- Application health monitoring