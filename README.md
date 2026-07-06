# FixMind

AI-powered facility maintenance management system.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.3+
- PostgreSQL 16+ with **pgvector** extension
- Database `fixmind` already created

### 1. Configure environment

```powershell
cd backend
copy .env.example .env
# Edit .env — set DATABASE_URL with your Postgres password
```

```powershell
cd frontend
copy .env.example .env
```

### 2. Run migrations & seed (when ready)

```powershell
cd backend
bun run migrate
bun run seed
```

Default admin after seed: `admin@fixmind.local` / `Admin123!@#`

### 3. Start development

```powershell
# Terminal 1
cd backend
bun run start:dev

# Terminal 2
cd frontend
bun run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/v1
- Health: http://localhost:3000/api/v1/health

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/SRS.md](docs/SRS.md) | Software requirements |
| [docs/DATABASE.md](docs/DATABASE.md) | ERD, schema, indexes |
| [docs/API.md](docs/API.md) | API reference |
| [docs/Design.md](docs/Design.md) | UI/UX design system |
| [docs/AGENT.md](docs/AGENT.md) | AI agent coding rules |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker, nginx, cloud |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Development phases |

## Architecture Decisions

- **No ORM** — raw SQL via `postgres.js` for control and performance
- **No FastAPI for MVP** — AI lives in NestJS `AiModule`, swappable later
- **Bun** — runtime and package manager for backend and frontend
- **Clean Architecture** — controllers thin, logic in services, SQL in repositories

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind v4, TanStack Query, Zustand |
| Backend | NestJS 11, JWT, class-validator |
| Database | PostgreSQL + pgvector |
| AI | Gemini 2.5 Flash |
| Deploy | Docker Compose, nginx |
