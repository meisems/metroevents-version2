# MetroEvents — NestJS Backend

A NestJS REST API backend for the Metro Events ERM system.

## Project Structure

```
src/
├── main.ts              # Entry point
├── app.module.ts        # Root module
├── database/            # TypeORM data source & seeder
├── auth/                # JWT & local auth, guards, strategies
├── common/              # Shared decorators & guards (roles)
├── users/               # Staff user management
├── clients/             # CRM — client pipeline
├── events/              # Event workspaces
├── quotes/              # Quotation builder
├── payments/            # Payment tracking
├── inventory/           # Inventory & reservations
├── suppliers/           # Supplier directory & POs
├── meetings/            # Meeting schedules
├── checklist/           # Phase-based checklist
├── tasks/               # Crew task assignments
├── moodboard/           # Design inspiration pegs
├── event-log/           # Real-time event day log
├── portal/              # Client portal
├── public/              # Landing page & order requests
├── reminders/           # Smart reminders
├── reports/             # Analytics & reports
├── files/               # File upload handling
├── mail/                # Email service
└── storage/             # Storage service
```

## Setup

```bash
npm install
cp .env.example .env
# Fill in .env with your database and JWT settings
npm run start:dev
```

## Docker

```bash
docker-compose up
```
