# Security

CueIT includes comprehensive security features designed for enterprise deployment.

## Security Features

### Authentication & Authorization
- Strong password hashing with bcrypt (12 salt rounds)
- Password complexity requirements
- Secure session management with httpOnly cookies
- Rate limiting on authentication endpoints

### Input Protection
- Comprehensive input validation on all endpoints
- XSS prevention through input sanitization
- SQL injection protection with parameterized queries
- Email and data format validation

### Network Security
- Security headers (CSP, XSS protection, CSRF prevention)
- HTTPS enforcement in production
- Rate limiting: 5 auth attempts per 15 minutes
- Request logging for security monitoring

### Kiosk Security
- Secure 8-character activation codes
- QR code validation and collision detection
- Token-based kiosk authentication
- Auto-expiring activation codes (1 hour)

## Production Deployment

### Required Environment Variables
```bash
SESSION_SECRET=your-secure-session-secret
KIOSK_TOKEN=your-kiosk-registration-token
ADMIN_PASSWORD=your-strong-admin-password
```

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set strong SESSION_SECRET
- [ ] Change default ADMIN_PASSWORD
- [ ] Configure KIOSK_TOKEN
- [ ] Enable request logging
- [ ] Monitor failed login attempts
- [ ] Regular security updates

### Monitoring
- Watch for rate limiting triggers
- Monitor failed authentication attempts
- Review security headers in browser dev tools
- Test kiosk activation flow regularly

## Security Considerations
- Keep activation codes short-lived
- Regular dependency updates
- Encrypted database backups
- Disaster recovery testing
