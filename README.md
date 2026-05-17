# Metro Events — Full-Stack Rebuild

> Event Resource Management System for Metro Events PH  
> NestJS · Next.js 14 · Prisma · Supabase · Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| API | NestJS 10, Prisma 5, Passport JWT |
| Frontend | Next.js 14 (App Router), TanStack Query, Zustand |
| Database | PostgreSQL via Supabase |
| File Storage | Supabase Storage |
| Styling | Tailwind CSS |
| Deploy API | Railway |
| Deploy Web | Vercel |

---

## Quick Start

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### 2. Clone & Install

```bash
git clone <your-repo>
cd metro-events
npm install
```

### 3. Configure Environment

```bash
# API
cp apps/api/.env.example apps/api/.env
# Fill in: DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET

# Web
cp apps/web/.env.local.example apps/web/.env.local
# Fill in: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Database Setup

```bash
cd apps/api

# Run migrations
npx prisma migrate dev --name init

# Seed with demo data + staff accounts
npx prisma db seed
```

### 5. Create Supabase Storage Buckets

In your Supabase dashboard → Storage, create these **public** buckets:
- `moodboard-pegs`
- `event-files`

### 6. Run Development Servers

```bash
# From root — starts both API and Web
npm run dev

# API runs at:  http://localhost:4000
# Web runs at:  http://localhost:3000
# Swagger docs: http://localhost:4000/api/docs
```

---

## Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@metroevents.ph | admin1234 |
| Coordinator | coordinator@metroevents.ph | coord1234 |
| Designer | designer@metroevents.ph | design1234 |
| Warehouse | warehouse@metroevents.ph | warehouse1234 |

---

## Project Structure

```
metro-events/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # 18 models, all enums
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── auth/           # JWT + Passport, roles guard
│   │       ├── clients/        # CRM + pipeline management
│   │       ├── events/         # Event workspace (core)
│   │       ├── quotes/         # Versioned quotes + line items
│   │       ├── payments/       # Payment schedule + tracking
│   │       ├── tasks/          # Task management per event
│   │       ├── checklist/      # Phase-based checklist + templates
│   │       ├── moodboard/      # Design peg uploads
│   │       ├── inventory/      # Stock tracking + reservations
│   │       ├── suppliers/      # Vendor directory + POs
│   │       ├── event-logs/     # Live event log + timeline
│   │       ├── after-events/   # Post-event ratings + feedback
│   │       ├── files/          # File uploads per event
│   │       ├── meetings/       # Ocular / meeting log
│   │       ├── reminders/      # Taglish templates + follow-ups
│   │       ├── reports/        # Analytics + dashboard stats
│   │       ├── users/          # User management (admin)
│   │       ├── admin/          # Client account approvals
│   │       ├── reviews/        # Public testimonials
│   │       └── storage/        # Supabase S3 wrapper
│   └── web/                    # Next.js 14 frontend
│       └── src/
│           ├── app/
│           │   ├── (auth)/     # Staff login
│           │   ├── (dashboard)/# Staff workspace
│           │   │   ├── dashboard/
│           │   │   ├── clients/
│           │   │   ├── events/ # Tabbed event workspace
│           │   │   ├── inventory/
│           │   │   ├── suppliers/
│           │   │   ├── meetings/
│           │   │   ├── reminders/
│           │   │   ├── reports/
│           │   │   └── admin/
│           │   └── portal/     # Client-facing portal
│           ├── components/
│           │   └── layout/     # Sidebar, topbar
│           ├── hooks/          # useAuth (Zustand)
│           └── lib/            # api.ts, utils.ts
└── packages/
    ├── types/                  # Shared TypeScript types
    └── utils/                  # formatPHP, pipeline helpers, templates
```

---

## Key Features

### Staff Dashboard
- **CRM Pipeline** — Kanban-style stages from inquiry → fully booked
- **Event Workspace** — 8 tabs: Overview, Moodboard, Quote, Checklist, Tasks, Payments, Event Log, Files
- **Quote Builder** — Versioned quotes with line items, auto-recalculate subtotal/discount/tax/grand total
- **Checklist** — Phase-based (pre-production → post-event), one-click template apply
- **Inventory** — Stock tracking with conflict-safe reservations
- **Reminders** — Taglish message templates, overdue payment alerts, stale lead detection
- **Reports** — Revenue charts, top clients, event type breakdown

### Client Portal
- View event details, color palette, coordinator info
- Browse approved moodboard pegs
- View and approve proposal/quote
- Track payment schedule and status
- Submit post-event star ratings + written feedback

### Roles & Permissions
| Role | Access |
|---|---|
| `admin` | Full access everywhere |
| `coordinator` | Events, CRM, quotes, payments, tasks, meetings |
| `designer` | Moodboard, inventory view, checklist view |
| `warehouse` | Inventory management, reservations |
| `client` | Portal only — read-only event details |

---

## Deployment

### API → Railway

```bash
# In Railway: New Project → Deploy from GitHub → apps/api
# Set environment variables in Railway dashboard
# railway.toml runs: npx prisma migrate deploy && node dist/main
```

### Web → Vercel

```bash
# vercel --cwd apps/web
# Set NEXT_PUBLIC_API_URL to your Railway URL
```

---

## API Endpoints (Summary)

All routes are prefixed with `/api`. Auth routes are public; all others require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | /auth/login | Login → JWT |
| POST | /auth/register | Register |
| GET | /auth/me | Current user profile |
| GET | /clients | List clients (filter by stage) |
| POST | /clients | Create client |
| PATCH | /clients/:id/advance-stage | Move to next pipeline stage |
| GET | /events | List events |
| POST | /events | Create event |
| GET | /events/:id | Full event workspace data |
| PATCH | /events/:id/status | Update event status |
| GET/POST | /quotes/event/:id | Get / create quote |
| POST | /quotes/:id/items | Add line item |
| PATCH | /quotes/:id/approve | Approve quote |
| GET/POST | /payments/event/:id | Get / add payment |
| PATCH | /payments/:id/mark-paid | Record payment |
| GET/POST | /checklist/event/:id | Get / add checklist item |
| POST | /checklist/event/:id/apply-template | Apply wedding/corporate/birthday template |
| PATCH | /checklist/:id/toggle | Check/uncheck item |
| POST | /moodboard/event/:id/upload | Upload design peg (multipart) |
| GET | /inventory | List inventory |
| POST | /inventory/reservations | Reserve items for event |
| GET | /reminders | Overdue + upcoming + stale leads |
| GET | /reminders/templates | Taglish message templates |
| POST | /reminders/templates/render | Render filled template |
| GET | /reports/dashboard | KPI stats |
| GET | /reports/revenue-by-month | Monthly revenue chart data |
| POST | /after-events/event/:id/client-feedback | Submit client rating |

Full interactive docs at `/api/docs` (Swagger UI).
