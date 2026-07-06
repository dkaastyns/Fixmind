# FixMind — Folder Structure

```
FixMind/
├── backend/
│   ├── migrations/              # Numbered SQL migrations
│   │   ├── 0001_init_extensions.sql
│   │   ├── 0002_create_users_and_sessions.sql
│   │   ├── 0003_create_facilities.sql
│   │   ├── 0004_create_reports.sql
│   │   └── 0005_create_ai_tables.sql
│   ├── scripts/
│   │   ├── migrate.ts           # Migration runner (bun run migrate)
│   │   └── seed.ts              # Admin seed (bun run seed)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   ├── database/
│   │   ├── common/
│   │   └── modules/
│   │       ├── auth/
│   │       ├── health/
│   │       └── ai/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── stores/
│   │   └── types/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── docs/                        # All project documentation
├── infra/
│   └── nginx/                   # Reverse proxy configs
├── docker-compose.yml
├── .env.example
└── README.md
```

## Planned Module Additions

```
backend/src/modules/
├── users/
├── rooms/
├── assets/
├── reports/
└── analytics/
```

```
frontend/src/features/
├── reports/
├── rooms/
├── users/
└── analytics/
```
