# FixMind — Backend Architecture

## Stack

- **NestJS 11** on **Bun**
- **postgres.js** for database access
- **JWT + httpOnly refresh cookies**
- **class-validator** DTOs
- **helmet + throttler** for security

## Module Structure

```
backend/src/
├── main.ts                 # Bootstrap, global pipes, CORS, helmet
├── app.module.ts           # Root module, global guards/filters
├── config/
│   └── env.validation.ts   # Validated environment variables
├── database/
│   ├── database.module.ts  # Global SQL connection provider
│   └── sql.ts              # postgres.js factory
├── common/
│   ├── decorators/         # @Roles, @Public, @CurrentUser
│   ├── filters/            # AllExceptionsFilter
│   ├── interceptors/       # TransformInterceptor (API envelope)
│   └── types/              # ApiResponse, database row types
└── modules/
    ├── auth/               # Login, refresh, logout, me
    ├── health/             # Health check
    └── ai/                 # LlmProvider, PriorityEngine
```

## Per-Module Pattern

```
modules/<name>/
├── <name>.controller.ts    # Routing only
├── <name>.module.ts
├── dto/
├── services/               # Business logic
├── repositories/           # Raw SQL only
└── entities/               # Row types (optional)
```

## Request Flow

```
HTTP Request
  → ThrottlerGuard
  → JwtAuthGuard (@Public bypass)
  → RolesGuard
  → Controller (DTO validation)
  → Service (business rules)
  → Repository (SQL)
  → TransformInterceptor (envelope)
```

## Security Layers

1. **helmet** — secure HTTP headers
2. **ValidationPipe** — whitelist + forbid unknown fields
3. **RBAC** — `@Roles()` decorator on endpoints
4. **Rate limiting** — `@nestjs/throttler`
5. **Password hashing** — bcrypt cost 12
6. **Refresh tokens** — SHA-256 hash in DB, httpOnly cookie

## AI Architecture

```
ReportCreatedEvent (future)
  → PriorityEngineService
    → LlmProviderService (Gemini HTTP)
  → Update report ai_* fields async
  → On failure: ai_analysis_status = FAILED, report still valid
```

Interface `LlmProviderService` allows future swap to external Python service without changing consumers.
