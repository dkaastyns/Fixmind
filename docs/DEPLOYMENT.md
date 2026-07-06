# FixMind — Deployment Documentation

## Local Development (Windows + Laragon)

See [LOCAL-SETUP-LARAGON.md](./LOCAL-SETUP-LARAGON.md).

Quick start after DB is ready:

```powershell
# Backend
cd backend
copy .env.example .env   # edit DATABASE_URL + JWT secrets
bun install
bun run migrate
bun run seed
bun run start:dev

# Frontend (new terminal)
cd frontend
copy .env.example .env
bun install
bun run dev
```

## Docker Compose (Production-like)

```bash
cp .env.example .env   # fill secrets
docker compose up -d --build
```

Services:
| Service | Port | Role |
|---------|------|------|
| nginx | 80, 443 | Reverse proxy |
| backend | 3000 (internal) | NestJS API |
| frontend | 80 (internal) | Static SPA |
| postgres | 5432 | Database `fixmind` |

## Nginx

- `infra/nginx/conf.d/fixmind.conf` — routes `/api/` → backend, `/` → frontend
- HTTPS block commented — enable after placing certs in `infra/nginx/certs/`

## Environment Strategy

| Environment | DATABASE_URL | CORS_ORIGIN | Cookies |
|-------------|--------------|-------------|---------|
| local | localhost:5432/fixmind | http://localhost:5173 | secure=false |
| staging | managed Postgres | staging URL | secure=true |
| production | managed Postgres | production URL | secure=true, sameSite=strict |

Never commit `.env` files.

## Backup Strategy

**PostgreSQL:**
- Daily `pg_dump` of database `fixmind`
- Retain 7 daily + 4 weekly backups
- Test restore monthly

```bash
pg_dump -U postgres -d fixmind -F c -f fixmind_$(date +%Y%m%d).dump
```

**Cloudinary:** rely on Cloudinary backup/versioning for uploaded media.

## Logging Strategy

| Layer | Tool |
|-------|------|
| NestJS | Built-in Logger → stdout |
| Nginx | `/var/log/nginx/access.log`, `error.log` |
| Production | Ship to centralized logging (e.g. DO Monitoring, Azure Log Analytics) |

Log levels: `error` in production, `debug` in development.

## Cloud Targets

- **DigitalOcean:** Droplet + Docker Compose + managed Postgres optional
- **Azure:** Container Apps or VM + Azure Database for PostgreSQL

## CI/CD (recommended)

1. Lint + test on PR
2. Build Docker images on merge to `main`
3. Deploy via SSH or container registry webhook
4. Run migrations before traffic switch
