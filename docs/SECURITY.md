# FixMind — Security Documentation

## Authentication

| Mechanism | Detail |
|-----------|--------|
| Access token | JWT, 15 minutes, Bearer header |
| Refresh token | Random 96-byte hex, SHA-256 stored in DB |
| Cookie | httpOnly, path `/api/v1/auth`, secure in production |
| Password | bcrypt, cost factor 12 |

## Authorization (RBAC)

Roles: `ADMIN`, `TECHNICIAN`, `USER`

Enforced via:
- `@Roles('ADMIN')` decorator
- Global `RolesGuard`
- Endpoints without `@Public()` require authentication

Business rules (e.g. "user can only view own reports") belong in **services**, not guards.

## Input Validation

- Global `ValidationPipe`: whitelist, forbidNonWhitelisted, transform
- DTOs with class-validator on every endpoint
- SQL: parameterized queries only via postgres.js tagged templates

## HTTP Security

- **helmet** — XSS, clickjacking headers
- **CORS** — explicit origin from env, credentials enabled
- **Rate limiting** — 100 req/min default (configurable)

## Secrets Management

| Secret | Storage |
|--------|---------|
| JWT_ACCESS_SECRET | env |
| JWT_REFRESH_SECRET | env |
| GEMINI_API_KEY | env |
| DATABASE_URL | env |
| Cloudinary keys | env |

Minimum 32 characters for JWT secrets in production.

## Session Management

- Refresh token rotation on `/auth/refresh`
- Revoke on logout
- `revoked_at` timestamp; expired sessions ignored

## Data Protection

- Soft delete preserves audit trail
- `report_histories` immutable log
- No PII in seed data

## Threat Model (MVP)

| Threat | Mitigation |
|--------|------------|
| SQL injection | Parameterized queries |
| XSS | React escaping + helmet CSP (tighten in prod) |
| CSRF | SameSite cookies + API-only refresh path |
| Brute force login | Rate limiting (add account lockout in v1.1) |
| Token theft | Short-lived access token, httpOnly refresh |

## Security Checklist Before Production

- [ ] Rotate all default secrets
- [ ] Enable HTTPS + HSTS in nginx
- [ ] Set `NODE_ENV=production`
- [ ] Restrict Postgres network access
- [ ] Enable Cloudinary signed uploads
- [ ] Review RBAC on every new endpoint
