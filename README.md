# minerva-tutor-platform

Full-stack take-home assignment for a tuition marketplace.

## Current Scope

This step defines the Prisma data model and seeded demo data. API business endpoints are intentionally not implemented yet.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker, for local PostgreSQL

## Environment

```sh
cp .env.example .env
```

The default `DATABASE_URL` points to the PostgreSQL service in `docker-compose.yml`.

## Database

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
