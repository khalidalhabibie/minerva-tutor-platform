# minerva-tutor-platform

Full-stack for a tuition marketplace. The project is being built incrementally.

## Current Scope

- Monorepo workspace.
- NestJS API in `apps/api`.
- PostgreSQL via Docker Compose.
- Prisma schema and initial migration for marketplace entities.
- Seeded demo Parent and Tutor users.
- Swagger/OpenAPI and business API endpoints will be expanded in later tasks.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker, for local PostgreSQL

## Environment

Copy the example environment file:

```sh
cp .env.example .env
```

Default local values point to the PostgreSQL service from `docker-compose.yml`.

## Database Setup

Start PostgreSQL:

```sh
docker compose up -d postgres
```

Install dependencies:

```sh
pnpm install
```

Generate Prisma Client:

```sh
pnpm prisma:generate
```

Run migrations:

```sh
pnpm prisma:migrate
```

Seed demo data:

```sh
pnpm seed
```

## Seed Credentials

All seeded users use this password:

```text
Password123!
```

Users:

- `parent@example.com` / Parent
- `tutor@example.com` / Tutor
- `second-tutor@example.com` / Tutor

Seed data includes two tutor profiles, two tuition cases owned by the parent, one active case invitation, and one sample tutor profile document metadata row.

## Backend Scripts

```sh
pnpm dev:api
pnpm build
pnpm test
pnpm lint
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```

## Repository Layout

```text
apps/
  api/        NestJS backend and Prisma schema
docs/         Planning and delivery notes
```
