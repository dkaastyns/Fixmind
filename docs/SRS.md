# FixMind — Software Requirements Specification (SRS)

## 1. Functional Requirements

### FR-AUTH
| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | System shall authenticate users via email/password |
| FR-AUTH-02 | System shall issue JWT access token (15m) + refresh token (7d, httpOnly cookie) |
| FR-AUTH-03 | System shall enforce RBAC: ADMIN, TECHNICIAN, USER |
| FR-AUTH-04 | System shall support session revocation on logout |

### FR-REPORTS
| ID | Requirement |
|----|-------------|
| FR-REP-01 | USER shall create maintenance reports with title, description, room, optional asset |
| FR-REP-02 | USER shall upload damage photos |
| FR-REP-03 | USER shall view own report history and status |
| FR-REP-04 | TECHNICIAN shall update assigned report progress |
| FR-REP-05 | ADMIN shall assign/reassign technicians |
| FR-REP-06 | USER shall rate completed reports (1–5) |

### FR-AI
| ID | Requirement |
|----|-------------|
| FR-AI-01 | System shall analyze new reports for priority (LOW/MEDIUM/HIGH/CRITICAL), score, reason |
| FR-AI-02 | System shall return maintenance recommendation, estimated hours, suggested action |
| FR-AI-03 | AI output shall be structured JSON |
| FR-AI-04 | AI failure shall not block report creation |

### FR-ADMIN
| ID | Requirement |
|----|-------------|
| FR-ADM-01 | ADMIN shall CRUD users and technicians |
| FR-ADM-02 | ADMIN shall CRUD rooms and assets |
| FR-ADM-03 | ADMIN shall view dashboard analytics |
| FR-ADM-04 | ADMIN shall export reports |

## 2. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Security | bcrypt passwords, JWT, helmet, rate limiting, env-based secrets |
| Performance | DB indexes on status, reporter, technician, created_at |
| Availability | AI optional path; core CRUD works without LLM |
| Maintainability | Repository pattern, module boundaries, typed row interfaces |
| UX | Mobile-first, loading/empty/error states, toast feedback |

## 3. API Contract

All endpoints return:

```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```

Prefix: `/api/v1`

## 4. Data Retention

- Soft delete on users, rooms, assets, reports (`deleted_at`)
- Report histories are append-only audit log
- Sessions revoked, not deleted
