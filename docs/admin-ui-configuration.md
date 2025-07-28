# CueIT Admin UI - Configuration Guide

## Logo Configuration

### Login Page Logo
- **Recommended dimensions:** 200x200 pixels or higher
- **Supported formats:** PNG, SVG, JPG
- **Location:** `/public/logo.png`
- **Dark mode variant:** `/public/logo-dark.png` (optional fallback to regular logo)
- **Container:** 80x80 pixel container with auto-sizing
- **Spacing:** 8px margin bottom for proper spacing
- **Display:** Auto-sizing with max width for better display

### Sidebar Logo  
- **Recommended dimensions:** 200x60 pixels (wide format)
- **Supported formats:** PNG, SVG, JPG
- **Location:** `/public/logo.png` (light mode), `/public/logo-dark.png` (dark mode)
- **Container:** Max width 120px, height 40px with auto-sizing
- **Responsive:** Truncated text on smaller screens
- **Fallback:** Automatic fallback to regular logo if dark version missing

### Kiosk Logo
- **Recommended dimensions:** 300x150 pixels or 400x200 pixels for optimal display
- **Supported formats:** PNG, SVG, JPG
- **Purpose:** Specifically designed for kiosk screens and displays
- **Configuration:** Upload via Settings > Portal Branding > Kiosk Logo
- **Display:** Optimized for kiosk screen sizes and viewing distances
- **Separate from portal:** Different from portal/admin interface logo

## Theme Configuration

### Available Themes
- **Light Mode:** Traditional light backgrounds and dark text
- **Dark Mode:** Dark backgrounds with light text  
- **System:** Automatically follows system preference (changes with OS settings)

### Theme Management
- **Settings Page:** Professional 3-button theme selector
- **Header Toggle:** Quick toggle button cycles through Light → Dark → System → Light
- **Icons:** Sun (Light), Moon (Dark), Computer (System)
- **Persistence:** Setting is persisted across sessions in localStorage
- **Real-time:** Instant theme switching without page reload
- **System Integration:** Automatically updates when OS theme changes (in System mode)

### Dark Mode Styling
All components support dark mode with proper contrast:
- **Background colors:** gray-50/gray-900
- **Card backgrounds:** white/gray-800
- **Text colors:** gray-900/gray-100
- **Border colors:** gray-200/gray-700
- **Button variants:** All variants have dark mode equivalents
- **Status indicators:** Maintain accessibility standards
- **Error displays:** Dark mode compatible styling
- **Tables and modals:** Complete dark mode coverage

## Status Indicators

### Global Status Management
- **Location:** Settings page > Status Configuration AND Kiosks page
- **Options:** Open, Closed, Meeting, BRB, Lunch
- **Persistence:** Robust save mechanism with error handling
- **Real-time:** Updates reflect immediately across kiosks
- **Configuration Preservation:** Maintains existing settings during updates
- **Error Recovery:** Automatic fallback and retry logic
- **Feedback:** Clear success/error toast messages

### Individual Kiosk Status
- **Location:** Kiosks page > Each kiosk row
- **Override:** Can override global status per kiosk
- **Visual:** Color-coded status indicators with dark mode support
- **Updates:** Real-time status changes with proper sync

## Integration Testing

### Test Functionality
- **Test Buttons:** Visible "Test" button for each integration in the list
- **Loading States:** Visual feedback during test execution
- **Results:** Detailed success/failure messages with context
- **Error Handling:** Comprehensive error reporting with troubleshooting hints

### SMTP Integration
- **Test button:** Available in integrations list
- **Requirements:** Valid SMTP settings configured
- **Response:** Success/failure feedback with detailed messages
- **Troubleshooting:** Check host, port, authentication settings

### Other Integrations
- **Slack:** Tests webhook connectivity and channel access
- **Teams:** Tests webhook URL and Microsoft Teams integration
- **Help Scout:** Tests API key validity and mailbox access
- **ServiceNow:** Integration removed
- **Generic Webhook:** Tests URL response and payload delivery

## Kiosk Activation Codes

### Generation Process
1. **From Kiosks page:** Click "Generate Code" button
2. **From Kiosk Management page:** Click "Generate New Activation"
3. **Result:** QR code + activation URL displayed
4. **Synchronization:** Codes appear in both locations automatically

### Code Management
- **Auto-refresh:** Activation codes list updates every 30 seconds
- **Manual Refresh:** Dedicated refresh button for immediate updates
- **Cross-page Sync:** Codes generated in either location appear in both
- **Expiration:** Codes expire after 24 hours by default
- **Single-use:** Each code can only be used once
- **Tracking:** View all active/used codes in Kiosk Management page
- **Cleanup:** Expired codes are automatically removed

## UI Best Practices

### Accessibility
- All form inputs have proper labels and titles
- Color indicators include text alternatives
- Keyboard navigation supported throughout
- Screen reader compatible
- WCAG compliant color schemes in both light and dark modes

### Responsive Design
- Mobile-first design approach
- Sidebar collapses on mobile devices
- Touch-friendly button sizes
- Optimized for tablets and desktop
- Proper logo scaling across device sizes

### Error Handling
- Toast notifications for all user actions
- Detailed error messages with context
- Network error detection and fallback
- Loading states for all async operations
- Dark mode compatible error displays

## Configuration Files

### Environment Variables
```
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_API=false
```

### Logo File Locations
```
/public/logo.png          # Light mode logo
/public/logo-dark.png     # Dark mode logo (optional)
/public/vite.svg          # Fallback icon
```

### Recommended File Structure
```
public/
├── logo.png              # Main logo (200x200 or 200x60)
├── logo-dark.png         # Dark mode variant
├── favicon.ico           # Browser favicon
└── vite.svg             # Development fallback
```

## Troubleshooting

### Theme Issues
- **White backgrounds in dark mode:** Clear browser cache, check CSS compilation
- **System theme not working:** Verify browser supports prefers-color-scheme
- **Theme not persisting:** Check localStorage permissions
- **Theme selector not updating:** Verify ThemeProvider is wrapping the app

### Logo Issues  
- **Logo not displaying:** Check file exists in /public/ folder
- **Logo too small/large:** Verify recommended dimensions (200x200 or 200x60)
- **Dark mode logo missing:** Ensure logo-dark.png exists or will fallback to regular logo
- **Logo not switching themes:** Check file naming and browser cache

### Status Updates Not Saving
- **Check API connection:** Verify backend is running on correct port
- **Check permissions:** Ensure user has admin privileges
- **Check network:** Look for network errors in browser console
- **Configuration conflicts:** Verify no conflicting status updates

### Integration Testing Failed
- **SMTP:** Verify host, port, username, password, TLS settings
- **Webhooks:** Check URL accessibility and authentication
- **API Keys:** Verify key validity and permissions
- **Network:** Check firewall and proxy settings
- **Test button missing:** Ensure integration is properly configured

### Activation Code Issues
- **Codes not syncing:** Check auto-refresh is working, use manual refresh button
- **QR codes not displaying:** Verify API is generating proper base64 data URLs
- **Codes not appearing:** Check both Kiosks and Kiosk Management pages
- **Auto-refresh not working:** Check browser console for JavaScript errors

## Support

For additional help:
1. Check browser console for detailed error messages
2. Verify API server is running and accessible
3. Review network requests in browser developer tools
4. Check API logs for backend errors
5. Verify theme system is properly initialized
6. Test logo files exist and are accessible
