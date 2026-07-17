# FixMind — Product Requirements Document (PRD)

## 1. Overview

**FixMind** is an AI-powered facility maintenance management system for organizations that need structured reporting, technician workflows, and administrator oversight.

AI acts as a **decision support system** — administrators always make final decisions on priority and assignment.

## 2. Problem Statement

Facility damage reports are often unstructured, delayed, and hard to prioritize. Administrators lack a single source of truth for rooms, assets, repair status, and performance metrics.

## 3. Goals

| Goal | Success Metric |
|------|----------------|
| Centralize maintenance requests | 100% reports created in-system |
| Reduce response time | Median time-to-assign < 24h |
| Improve transparency | Users can track status end-to-end |
| Support prioritization | AI provides structured priority + recommendation |
| Enterprise maintainability | Modular NestJS + raw SQL repositories |

## 4. User Roles

### User
Submit reports, upload damage photos, track status, rate completed work.

### Technician
View assigned reports, update progress, upload repair photos, mark complete.

### Administrator
Manage users/technicians/rooms/assets, review reports, assign technicians, analytics, export.

## 5. Core Features (MVP → v1)

| Phase | Features |
|-------|----------|
| **Foundation** (current) | Auth, DB schema, dashboard shell, AI module skeleton |
| **MVP** | Reports CRUD, room/asset management, technician assignment |
| **v1** | AI priority on report create, ratings, attachments (Cloudinary), export |
| **v1.1** | Analytics charts |

## 6. Non-Goals (MVP)

- Native mobile apps
- Separate Python/FastAPI AI service
- External vector databases (Pinecone, etc.)
- Multi-tenant organizations

## 7. Design Principles

See [Design.md](./Design.md) — glassmorphism, gradient `#EECDA3 → #EF629F`, mobile-first, minimal motion.

## 8. Technical Constraints

- **Runtime:** Bun
- **Backend:** NestJS, Clean Architecture per module
- **Database:** PostgreSQL `fixmind`, raw SQL via `postgres.js`
- **No ORM:** Prisma/TypeORM/Drizzle prohibited
- **AI:** Internal `AiModule` calling Gemini 2.5 Flash

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI downtime blocks reports | Async AI analysis; report creation succeeds without AI |
| LLM cost | Usage logging, rate limiting, timeouts |
| Schema drift | Numbered SQL migrations only |
