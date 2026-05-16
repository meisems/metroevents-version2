# MetroEvents ERM

Event Resource Management System — Full-stack monorepo.

## Structure

```
MetroEvents/
├── backend/    # NestJS API (TypeORM + PostgreSQL)
└── frontend/   # Next.js 14 App Router (Tailwind CSS)
```

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env   # fill in DB, JWT, SMTP, AWS S3 values
npm install
npm run migration:run
npm run seed
npm run start:dev      # runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev            # runs on http://localhost:3000
```

### Docker (Backend)
```bash
cd backend
docker-compose up -d   # starts API + PostgreSQL
```

For full setup details, see the full documentation inside this repo.
