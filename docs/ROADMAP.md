# FixMind — Development Roadmap

## Phase 0 — Foundation ✅ (current)

- [x] Project scaffold (NestJS + React/Vite)
- [x] Database schema design + migration files
- [x] postgres.js DatabaseModule
- [x] Auth module (login, refresh, logout, me)
- [x] AiModule skeleton (Gemini priority analysis)
- [x] Frontend design system + login + dashboard shell
- [x] Docker Compose + nginx config
- [x] Core documentation

## Phase 1 — MVP Core (2–3 weeks)

- [ ] Run migrations + seed admin
- [ ] Users module (ADMIN CRUD)
- [ ] Rooms & assets module
- [ ] Reports module (create, list, detail, status workflow)
- [ ] Report histories on every state change
- [ ] Wire AI priority on report create (async)
- [ ] Frontend: report form, list, detail pages

## Phase 2 — Technician Workflow (1–2 weeks)

- [ ] Assignment flow (ADMIN)
- [ ] Technician inbox + progress updates
- [ ] Cloudinary photo upload (damage + repair)
- [ ] Mark complete + user rating

## Phase 3 — Admin Analytics (1 week)

- [ ] Dashboard live stats API
- [ ] Charts (reports by status, priority, room)
- [ ] CSV export

## Phase 5 — Production Hardening

- [ ] Unit tests for services
- [ ] E2E auth flow tests
- [ ] CI pipeline
- [ ] Monitoring + alerting
- [ ] Backup automation

## Architecture Evolution

| Trigger | Action |
|---------|--------|
| Custom vision model needed | Extract AiModule to Python service |
| High read load | Read replicas + caching |
| Multi-tenant | Add `organization_id` to core tables |
