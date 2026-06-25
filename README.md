# minerva-tutor-platform

Full-stack take-home assignment for a tuition marketplace. The project is being built incrementally, starting with a NestJS backend foundation.

## Current Scope

- Monorepo workspace.
- NestJS API in `apps/api`.
- PostgreSQL via Docker Compose.
- Swagger/OpenAPI at `/docs`.
- Health endpoint at `GET /health`.
- Global request validation.
- Safe global exception responses.
- Config module and Prisma placeholder.

Business features are intentionally not implemented yet.

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

## Run PostgreSQL

```sh
docker compose up -d postgres
```

## Install Dependencies

```sh
pnpm install
```

## Run the Backend

```sh
pnpm dev:api
```

The API defaults to `http://localhost:3001`.

Useful endpoints:

- `GET http://localhost:3001/health`
- `GET http://localhost:3001/docs`

## Backend Scripts

```sh
pnpm dev:api
pnpm build
pnpm test
pnpm lint
pnpm prisma:generate
pnpm prisma:migrate
```

## Repository Layout

```text
apps/
  api/        NestJS backend
docs/         Planning and delivery notes
```
