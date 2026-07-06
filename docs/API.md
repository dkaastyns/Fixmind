# FixMind — API Documentation

Base URL: `http://localhost:3000/api/v1`

## Response Format

### Success
```json
{
  "success": true,
  "message": "Login successful",
  "data": { }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "email must be an email" }]
}
```

---

## Authentication

Refresh token is stored in **httpOnly cookie** `fixmind_refresh` on path `/api/v1/auth`.

Access token is returned in JSON and sent as `Authorization: Bearer <token>`.

### POST /auth/login
**Public** | Login

**Body:**
```json
{ "email": "admin@fixmind.local", "password": "Admin123!@#" }
```

**Response data:**
```json
{
  "user": { "id": "...", "email": "...", "fullName": "...", "role": "ADMIN" },
  "accessToken": "eyJ...",
  "expiresIn": "15m"
}
```

### POST /auth/refresh
**Public** | Refresh access token (uses cookie)

### POST /auth/logout
**Authenticated** | Revoke session, clear cookie

### GET /auth/me
**Authenticated** | Current user profile

---

## Health

### GET /health
**Public** | API health check

---

## Planned Endpoints (next iterations)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | /reports | USER+ | List own reports |
| POST | /reports | USER | Create report |
| GET | /reports/:id | USER+ | Report detail |
| PATCH | /reports/:id/status | TECHNICIAN, ADMIN | Update status |
| POST | /reports/:id/assign | ADMIN | Assign technician |
| POST | /reports/:id/attachments | USER, TECHNICIAN | Upload photo |
| POST | /reports/:id/rating | USER | Rate completed report |
| CRUD | /rooms | ADMIN | Room management |
| CRUD | /assets | ADMIN | Asset management |
| CRUD | /users | ADMIN | User management |
| GET | /analytics/summary | ADMIN | Dashboard stats |
| GET | /analytics/export | ADMIN | Export CSV |

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (RBAC) |
| 404 | Not found |
| 409 | Conflict |
| 429 | Rate limited |
| 500 | Server error |
