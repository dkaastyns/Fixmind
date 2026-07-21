# FixMind — Frontend Architecture

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- TanStack Query (server state)
- Zustand (auth session in memory)
- React Router 7
- React Hook Form + Zod
- Framer Motion (subtle transitions)

## Folder Structure

```
frontend/src/
├── app/
│   ├── router.tsx          # Route definitions
│   └── router-guards.tsx   # Protected / guest routes
├── components/
│   ├── layout/             # DashboardLayout
│   └── ui/                 # Button, Input, GlassCard
├── features/
│   ├── auth/pages/         # LoginPage
│   └── dashboard/pages/    # DashboardHomePage
├── lib/
│   ├── api-client.ts       # Fetch wrapper + auth endpoints
│   └── utils.ts            # cn() helper
├── stores/
│   └── auth-store.ts       # accessToken + user (memory only)
├── types/
│   └── api.ts
└── index.css               # Design tokens (Design.md)
```

## State Management

| State | Tool | Notes |
|-------|------|-------|
| Server data | TanStack Query | All API fetching |
| Auth session | Zustand | Access token in memory |
| Refresh token | httpOnly cookie | Never localStorage |
| Form state | React Hook Form | Per-form |

## Design System

Implemented per [Design.md](./Design.md):

- Background `#FAFAFC`
- Gradient `linear-gradient(90deg, #EECDA3, #EF629F)`
- Glass cards: `rgba(255,255,255,0.72)` + backdrop blur
- Font: Inter
- Motion: 150–300ms fade/slide

## API Integration

- Base URL: `VITE_API_BASE_URL` (default `/api/v1`)
- Vite dev proxy forwards `/api` → `localhost:3000`
- `credentials: 'include'` for refresh cookie

## Route Map

| Path | Access | Page |
|------|--------|------|
| /login | Guest | Login |
| /dashboard | Auth | Home stats |
| /dashboard/profile | Auth | User Profile & Settings |
| /dashboard/reports | Auth | Reports Management |
| /dashboard/rooms | Auth | Rooms & Assets Management |
| /dashboard/asset-transfers | Auth | Asset Transfer Requests |
| /dashboard/asset-transfers/review | Admin | Asset Transfer Approvals |
| /dashboard/maintenance | Auth | Maintenance Schedules |
| /dashboard/users | Admin | Users Management |
| /dashboard/analytics | Admin | Analytics Dashboard |
