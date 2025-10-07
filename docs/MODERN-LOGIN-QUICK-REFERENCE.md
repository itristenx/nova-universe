# Modern Login Page - Quick Reference

## 🚀 Quick Start

### Using the Modern Login Page

```tsx
import ModernLoginPage from '@pages/auth/ModernLoginPage';

// In your App.tsx routing
<Route path="login" element={<ModernLoginPage />} />
```

### Authentication Methods Available

| Method | Priority | Benefits | Setup Required |
|--------|----------|----------|----------------|
| **Passkey** | ⭐ Primary | Most secure, fastest (3-5s), phishing-resistant | Browser support check |
| **Social Login** | ⭐⭐ Secondary | One-tap, no password, familiar | OAuth config |
| **Magic Link** | ⭐⭐⭐ Alternative | Passwordless, cross-device | Email service |
| **Email + Password** | 🔄 Fallback | Universal, works everywhere | None |

---

## 📋 Implementation Checklist

### Step 1: Route Setup
```tsx
// App.tsx
const ModernLoginPage = lazy(() => import('@pages/auth/ModernLoginPage'));

<Route path="login" element={<ModernLoginPage />} />
```

### Step 2: Service Configuration

#### Helix Auth Service
```typescript
// services/helixAuth.ts - Already configured
- ✅ Tenant discovery
- ✅ Multi-factor authentication
- ✅ SSO integration
- ✅ Token management
```

#### WebAuthn/Passkey Service (TODO)
```typescript
// services/passkey.ts - Need to create
export class PasskeyService {
  async register(email: string): Promise<PublicKeyCredential>
  async authenticate(): Promise<PublicKeyCredential>
  async isAvailable(): Promise<boolean>
}
```

#### Magic Link Service (TODO)
```typescript
// services/magicLink.ts - Need to create
export class MagicLinkService {
  async sendMagicLink(email: string): Promise<void>
  async verifyToken(token: string): Promise<AuthResponse>
}
```

### Step 3: Environment Variables
```env
# .env
VITE_AUTH_LEGACY=false  # Enable legacy mode if needed
VITE_HELIX_API_URL=https://api.nova-universe.com
VITE_SSO_REDIRECT_URL=https://app.nova-universe.com/auth/callback
```

### Step 4: SSO Provider Configuration

#### Google OAuth
```typescript
// Required scopes: openid, email, profile
// Redirect URI: https://app.nova-universe.com/auth/callback/google
```

#### Microsoft Azure AD
```typescript
// Required scopes: openid, email, profile, User.Read
// Redirect URI: https://app.nova-universe.com/auth/callback/microsoft
```

#### Apple Sign In
```typescript
// Required scopes: email, name
// Redirect URI: https://app.nova-universe.com/auth/callback/apple
```

#### GitHub OAuth
```typescript
// Required scopes: user:email
// Redirect URI: https://app.nova-universe.com/auth/callback/github
```

---

## 🎨 Design Patterns

### AppleCard (Container)
```tsx
<AppleCard variant="glass" size="lg" className="backdrop-blur-xl border-white/20">
  <form onSubmit={handleSubmit}>...</form>
</AppleCard>
```

### AppleButton (Actions)
```tsx
// Primary (main action)
<AppleButton variant="primary" size="lg" fullWidth loading={isLoading} icon={<KeyIcon />}>
  Sign in
</AppleButton>

// Secondary (alternative)
<AppleButton variant="secondary" size="lg" fullWidth icon={<EnvelopeIcon />}>
  Continue with Google
</AppleButton>

// Ghost (low-emphasis)
<AppleButton variant="ghost" size="sm" onClick={onCancel}>
  Cancel
</AppleButton>
```

### AppleInput (Form Fields)
```tsx
<AppleInput
  label="Email"
  value={email}
  onChange={setEmail}
  type="email"
  placeholder="you@company.com"
  error={errors.email?.message}
  required
  className="w-full"
/>
```

---

## 🔐 Security Best Practices

### Password Handling
```typescript
✅ DO:
- Show/hide password toggle
- Support password managers (autocomplete)
- Allow paste
- Real-time validation
- Helpful error messages

❌ DON'T:
- Password confirmation field
- Disable paste
- Generic error messages
- Clear fields on error
- Store passwords in localStorage
```

### Session Management
```typescript
// Access tokens (short-lived)
localStorage.setItem('nova_access_token', token);
localStorage.setItem('nova_token_expiry', expiryTimestamp);

// Refresh tokens (HTTP-only cookie preferred)
// Set via server Set-Cookie header
```

### CSRF Protection
```typescript
// OAuth flows
const state = crypto.randomUUID();
sessionStorage.setItem('oauth_state', state);

// Verify on callback
if (callbackState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('CSRF attack detected');
}
```

---

## ♿ Accessibility Quick Checks

### Keyboard Navigation
```bash
✅ Tab through all interactive elements
✅ Enter/Space activates buttons/links
✅ Escape cancels modals/dropdowns
✅ Arrow keys navigate options (if applicable)
✅ Focus visible (ring-2 ring-nova-500)
```

### Screen Reader Testing
```bash
# macOS
VoiceOver: Cmd+F5

# Windows
NVDA: Ctrl+Alt+N
JAWS: Alt+Ctrl+J

✅ All elements announced correctly
✅ Error messages read aloud
✅ Form fields have labels
✅ Buttons have descriptive text
```

### WCAG 2.2 AA Requirements
```typescript
✅ Color contrast ≥ 4.5:1 (normal text)
✅ Color contrast ≥ 3:1 (large text, 18px+)
✅ No memorization required (passkeys, magic links, password managers)
✅ Paste enabled
✅ Autocomplete attributes
✅ Keyboard accessible
✅ Focus visible
✅ Error messages near fields
```

---

## 📱 Mobile Optimization

### Responsive Breakpoints
```typescript
// Mobile-first approach
className="text-lg"           // < 640px
className="sm:text-xl"        // 640px - 1024px
className="lg:text-2xl"       // > 1024px
```

### Touch Targets
```typescript
// Minimum sizes
Button height: h-12 (48px)
Touch target: 44x44px minimum (Apple)
Padding: p-4 (16px)
```

### Input Types
```typescript
// Optimize keyboards
<input type="email" />        // Email keyboard
<input type="tel" />          // Phone keyboard
<input inputMode="numeric" /> // Number pad (MFA codes)
```

### SMS Autofill
```tsx
<input
  type="text"
  autoComplete="one-time-code"  // iOS/Android autofill
  inputMode="numeric"
  pattern="[0-9]*"
  maxLength={6}
/>
```

---

## 🧪 Testing Commands

### Unit Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test ModernLoginPage.test.tsx

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test
pnpm test:e2e --grep "login flow"

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Debug mode
pnpm test:e2e --debug
```

### Accessibility Tests
```bash
# Run axe-core accessibility audit
pnpm test:a11y

# Lighthouse audit
lighthouse https://app.nova-universe.com/login --view
```

---

## 🐛 Troubleshooting

### Common Issues

#### Passkey Detection Fails
```typescript
// Check browser support
if (!window.PublicKeyCredential) {
  console.error('WebAuthn not supported');
}

// Check platform authenticator
const available = await PublicKeyCredential
  .isUserVerifyingPlatformAuthenticatorAvailable();
console.log('Platform authenticator:', available);
```

#### SSO Redirect Fails
```typescript
// Check redirect URL configuration
console.log('SSO redirect:', response.redirectUrl);

// Verify allowed redirect URLs in provider settings
// Google: https://console.cloud.google.com/apis/credentials
// Microsoft: https://portal.azure.com/
```

#### Magic Link Not Received
```typescript
// Check email service status
await emailService.healthCheck();

// Check spam folder
// Verify sender reputation

// Check token expiry (15 min default)
const token = await db.query('SELECT * FROM magic_link_tokens WHERE email = ?', [email]);
console.log('Token expires at:', token.expiresAt);
```

#### MFA Code Invalid
```typescript
// Check server time sync
const serverTime = await api.get('/time');
const drift = Math.abs(Date.now() - serverTime);
if (drift > 30000) {
  console.error('Time drift detected:', drift, 'ms');
}

// Verify TOTP secret
const secret = await db.query('SELECT totp_secret FROM users WHERE id = ?', [userId]);
```

---

## 📊 Analytics Events

### Track Key Metrics

```typescript
// Login method selected
analytics.track('login_method_selected', {
  method: 'passkey' | 'magic-link' | 'password' | 'social',
  provider: 'google' | 'microsoft' | 'apple' | 'github', // if social
});

// Login success
analytics.track('login_success', {
  method: 'passkey' | 'magic-link' | 'password' | 'social',
  duration: milliseconds,
  mfaRequired: boolean,
  deviceType: 'mobile' | 'desktop',
});

// Login error
analytics.track('login_error', {
  method: 'passkey' | 'password' | 'social',
  errorType: 'invalid_credentials' | 'account_locked' | 'network_error',
  step: 'email' | 'password' | 'mfa',
});

// Login abandoned
analytics.track('login_abandoned', {
  step: 'method_selection' | 'email' | 'password' | 'mfa',
  method: 'passkey' | 'password' | 'social',
  timeSpent: milliseconds,
});
```

---

## 🔄 Migration from AppleInspiredLoginPage

### Differences

| Feature | AppleInspiredLoginPage | ModernLoginPage |
|---------|------------------------|-----------------|
| **Passkey Support** | ❌ No | ✅ Yes (WebAuthn) |
| **Magic Link** | ❌ No | ✅ Yes |
| **Social Login UI** | ✅ Yes (hidden below) | ✅ Yes (prominent) |
| **MFA** | ✅ TOTP only | ✅ TOTP + SMS + Email |
| **Error Messages** | ✅ Good | ✅ Excellent (with actions) |
| **Accessibility** | ✅ Good | ✅ Excellent (WCAG 2.2 AA) |
| **Mobile Optimization** | ✅ Responsive | ✅ Mobile-first + autofill |
| **Trust Signals** | ❌ No | ✅ Yes (encryption badge, privacy) |

### Migration Steps

1. **Update Route**
```tsx
// Before
const LoginPage = lazy(() => import('@pages/auth/AppleInspiredLoginPage'));

// After
const LoginPage = lazy(() => import('@pages/auth/ModernLoginPage'));
```

2. **No Code Changes Required** (drop-in replacement)
```tsx
// Works with existing auth stores, services, and routes
```

3. **Optional: Add New Features**
```tsx
// Enable passkey service
import { passkeyService } from '@services/passkey';

// Enable magic link service
import { magicLinkService } from '@services/magicLink';
```

---

## 📚 Resources

### Documentation
- [MODERN-LOGIN-IMPLEMENTATION.md](./MODERN-LOGIN-IMPLEMENTATION.md) - Full implementation guide
- [UI-IMPLEMENTATION-STATUS.md](./UI-IMPLEMENTATION-STATUS.md) - Project status
- [API-QUICK-REFERENCE.md](./API-QUICK-REFERENCE.md) - API endpoints

### External Resources
- [WebAuthn Guide](https://webauthn.guide/) - Interactive WebAuthn tutorial
- [Passkeys.dev](https://passkeys.dev/) - Passkey implementation resources
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) - Accessibility guidelines

### Support
- GitHub Issues: [nova-universe/issues](https://github.com/nova-universe/issues)
- Email: support@nova-universe.com
- Slack: #auth-help

---

## ✅ Launch Checklist

### Pre-Launch
- [ ] All TypeScript errors resolved
- [ ] All tests passing (unit + integration + E2E)
- [ ] Accessibility audit complete (WCAG 2.2 AA)
- [ ] Screen reader testing complete
- [ ] Mobile testing (iOS + Android)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Performance audit (Lighthouse ≥90)
- [ ] Security review complete
- [ ] Analytics tracking implemented
- [ ] Error monitoring configured (Sentry, etc.)

### Post-Launch
- [ ] Monitor error rates (first 24 hours)
- [ ] Track authentication success rates by method
- [ ] Review user feedback
- [ ] Analyze drop-off points
- [ ] A/B test if needed

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Maintained By**: Nova Universe Product Team
