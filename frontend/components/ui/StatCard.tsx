
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'orange' | 'purple';
  highlight?: boolean;
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   ring: 'ring-blue-500/20' },
  red:    { bg: 'bg-red-500/10',    icon: 'text-red-400',    ring: 'ring-red-500/20' },
  green:  { bg: 'bg-green-500/10',  icon: 'text-green-400',  ring: 'ring-green-500/20' },
  yellow: { bg: 'bg-yellow-500/10', icon: 'text-yellow-400', ring: 'ring-yellow-500/20' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', ring: 'ring-orange-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', ring: 'ring-purple-500/20' },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', highlight }: StatCardProps) {
  const colors = COLOR_MAP[color];
  return (
    <div className={cn(
      'bg-[#16213E] rounded-xl border p-5 transition-all',
      highlight ? `border-${color}-500/40 ring-1 ${colors.ring}` : 'border-[#0F3460]/50',
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>
      </div>
    </div>
  );
}
</parameter>

<creaoArtifact identifier="backend-dockerfile" type="application/code" language="dockerfile" title="backend/Dockerfile" path="files/metro-events-v2/backend/Dockerfile">
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
</parameter>

<creaoArtifact identifier="frontend-dockerfile" type="application/code" language="dockerfile" title="frontend/Dockerfile" path="files/metro-events-v2/frontend/Dockerfile">
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
</parameter>

Now let's write the master README:

<creaoArtifact identifier="master-readme" type="text/markdown" title="MetroEvents v2.0 — README.md" path="files/metro-events-v2/README.md">
# Metro Events v2.0 — ERM System

> Event Resource Management system rebuilt with a modern stack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **State** | TanStack Query (server state), Zustand (client state) |
| **Backend** | NestJS (Node.js), TypeScript, TypeORM |
| **Database** | PostgreSQL 16 |
| **Storage** | S3-compatible (Backblaze B2 / AWS S3) |
| **Auth** | JWT + Passport.js, Role-Based Access Control |
| **Email** | Nodemailer (SMTP) |
| **PDF** | Puppeteer (quote export) |
| **Container** | Docker + Docker Compose |

---

## Project Structure

```
metro-events-v2/
├── docker-compose.yml
├── backend/                          # NestJS API
│   ├── src/
│   │   ├── main.ts                   # App bootstrap + Swagger
│   │   ├── app.module.ts             # Root module
│   │   ├── modules/
│   │   │   ├── auth/                 # JWT auth, guards, decorators
│   │   │   ├── users/                # User entity + management
│   │   │   ├── clients/              # CRM pipeline
│   │   │   ├── events/               # Event workspaces
│   │   │   ├── quotes/               # Quote builder + PDF
│   │   │   ├── payments/             # Payment tracking
│   │   │   ├── inventory/            # Item catalog + reservations
│   │   │   ├── suppliers/            # Suppliers + POs
│   │   │   ├── moodboard/            # Moodboard pegs
│   │   │   ├── checklist/            # Phase checklists
│   │   │   ├── tasks/                # Crew task assignments
│   │   │   ├── meetings/             # Meeting schedules
│   │   │   ├── event-log/            # Event day log
│   │   │   ├── files/                # Event file uploads
│   │   │   ├── reminders/            # Smart reminders
│   │   │   ├── reports/              # Analytics (admin)
│   │   │   ├── portal/               # Client portal API
│   │   │   ├── public/               # Landing page API
│   │   │   ├── storage/              # S3 upload service
│   │   │   └── mail/                 # Email service
│   │   └── database/
│   │       ├── data-source.ts
│   │       ├── migrations/
│   │       └── seed.ts
│   ├── .env.example
│   └── Dockerfile
│
└── frontend/                         # Next.js App
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/               # Login, Register pages (no sidebar)
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   ├── (dashboard)/          # Protected staff pages
    │   │   │   ├── layout.tsx        # Sidebar + TopBar wrapper
    │   │   │   ├── dashboard/        # KPI dashboard + reminders
    │   │   │   ├── clients/          # CRM pipeline
    │   │   │   │   └── [id]/         # Client detail
    │   │   │   ├── events/           # Event list
    │   │   │   │   └── [id]/         # Event workspace (9 tabs)
    │   │   │   ├── inventory/        # Inventory catalog
    │   │   │   ├── suppliers/        # Supplier directory + POs
    │   │   │   ├── meetings/         # Meeting schedule
    │   │   │   ├── reminders/        # Smart reminders + Taglish templates
    │   │   │   ├── reports/          # Charts + analytics (admin only)
    │   │   │   └── admin/            # Account approvals + user mgmt
    │   │   ├── (portal)/             # Client portal (separate layout)
    │   │   │   └── portal/           # My event: quote, payments, moodboard
    │   │   └── (public)/             # Landing page
    │   │       └── page.tsx
    │   ├── components/
    │   │   ├── layout/               # Sidebar, TopBar
    │   │   ├── dashboard/            # StatCard, UpcomingEvents, etc.
    │   │   ├── events/               # CreateEventModal, tabs/*
    │   │   ├── clients/              # CreateClientModal
    │   │   ├── ui/                   # Reusable: Badge, Modal, Table, etc.
    │   │   └── forms/                # Shared form components
    │   ├── lib/
    │   │   ├── api.ts                # Axios client + all API calls
    │   │   └── utils.ts              # cn(), formatCurrency(), formatDate()
    │   ├── stores/
    │   │   └── auth.store.ts         # Zustand auth store (persisted)
    │   └── types/
    │       ├── event.ts
    │       └── client.ts
    ├── tailwind.config.ts
    └── Dockerfile
```

---

## Quick Start (Local Development)

### Prerequisites
- Docker + Docker Compose
- Node.js 20+

### 1. Clone & configure environment

```bash
cd metro-events-v2

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DB, JWT, S3, and SMTP credentials

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Edit NEXT_PUBLIC_API_URL if needed
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- NestJS API on `http://localhost:3001`
- Next.js frontend on `http://localhost:3000`

### 3. Run DB migrations & seed

```bash
cd backend
npm install
npm run migration:run
npm run seed          # creates default admin@metroevents.ph / admin1234
```

### 4. Access

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend |
| http://localhost:3000/login | Staff login |
| http://localhost:3000/portal | Client portal |
| http://localhost:3001/api/docs | Swagger API docs |

---

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access, reports, user management |
| `coordinator` | Events, clients, tasks, meetings, suppliers |
| `designer` | Moodboard, design approvals |
| `warehouse` | Inventory catalog and reservations |
| `client` | Own event portal only |

Role enforcement is handled by the `@Roles()` decorator + `RolesGuard` in NestJS, and route-level checks in Next.js via the `useAuthStore`.

---

## Key Features

### Backend (NestJS)

- **JWT Authentication** — Access tokens, email verification flow, admin approval step
- **RBAC** — `@Roles(UserRole.ADMIN)` decorator on any controller method
- **S3 Storage Service** — Generic `upload(folder, name, buffer, mime)` used for proofs, pegs, avatars
- **Quote PDF** — Puppeteer renders the quote to PDF on `GET /quotes/:id/pdf`
- **Smart Reminders** — `GET /reminders` aggregates: events in 7 days, overdue payments, stale CRM clients, supplier deliveries today
- **Taglish Templates** — Pre-filled message templates for 7 common scenarios
- **TypeORM Entities** — All 16 entities match the original Flask models, adapted to Postgres with UUIDs

### Frontend (Next.js)

- **Dark theme** — Deep navy sidebar (`#16213E`) + gold accent (`#C9A84C`)
- **Event Workspace** — 9-tab layout (Overview, Moodboard, Quote, Checklist, Tasks, Inventory, Suppliers, Payments, Event Day Log)
- **CRM Pipeline** — Clickable strip showing counts per stage, one-click "Advance Stage"
- **Quote Builder** — Live totals, versioning, PDF download, client approval
- **Reports** — Recharts bar/line/pie charts: monthly revenue, pipeline funnel, events by type, top 5 revenue, ratings
- **Client Portal** — Separate portal route group, shows quote + approve, payments, moodboard pegs, feedback form
- **TanStack Query** — All API calls cached with automatic invalidation on mutations

---

## S3 Storage (Backblaze B2 / AWS S3)

Configure in `backend/.env`:

```env
# Backblaze B2
S3_ENDPOINT=https://s3.us-west-002.backblazeb2.com
S3_REGION=us-west-002
S3_BUCKET=metroevents-uploads
S3_ACCESS_KEY_ID=xxxx
S3_SECRET_ACCESS_KEY=xxxx
S3_PUBLIC_URL=https://f002.backblazeb2.com/file/metroevents-uploads

# OR AWS S3 — remove S3_ENDPOINT line (AWS SDK uses region default)
S3_REGION=ap-southeast-1
S3_BUCKET=metroevents-uploads
S3_ACCESS_KEY_ID=AKIAXXXX
S3_SECRET_ACCESS_KEY=xxxx
S3_PUBLIC_URL=https://metroevents-uploads.s3.ap-southeast-1.amazonaws.com
```

Files are uploaded to logical folders: `payments/`, `moodboard/`, `avatars/`, `event-files/`, `supplier-proofs/`.

---

## Deployment (Production)

### Backend (e.g. Railway / Render)
```bash
npm run build
npm start
# Set NODE_ENV=production — uses TypeORM migrations, not synchronize
```

### Frontend (Vercel)
```bash
# Set env vars in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
vercel deploy
```

---

*Metro Events v2.0 — Creating memories.* ✨
</parameter>