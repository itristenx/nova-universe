# Security Baseline

- Authentication: BFF with PKCE; no tokens in browser storage; httpOnly Secure SameSite cookies
- Authorization: RBAC and ABAC; server-side checks on every API; defense in depth
- Input handling: central validation (zod/validator), output encoding, CSP via helmet
- Session management: rotation on privilege change; short access lifetime; refresh rotation with reuse detection
- CSRF: double-submit or SameSite=Lax; CSRF token on non-GET forms
- Cryptography: modern algorithms only; bcrypt for passwords, libsodium or Node crypto for secrets
- Secrets: environment/secret manager; no secrets in repo
- Logging: structured, no sensitive data; audit trail for admin and data access
- Supply chain: lockfiles, SCA, minimal permissions in CI and containers
- Compliance: data minimization, PII tagging, right-to-erasure workflows