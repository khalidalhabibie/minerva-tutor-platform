# minerva-tutor-platform

Full-stack tuition marketplace built incrementally as a take-home project.

## Current Scope

- Monorepo workspace.
- NestJS API in `apps/api`.
- PostgreSQL via Docker Compose.
- Prisma schema, migrations, and seeded demo data.
- JWT auth, role-based access control, tuition cases, tutor profiles, and secure local document storage.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker, for local PostgreSQL

## Backend Setup

Copy the example environment file:

```sh
cp .env.example .env
```

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

Run the backend:

```sh
pnpm dev:api
```

The API defaults to `http://localhost:3001`.

## Environment Variables

The backend reads these values from `.env`:

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: secret used to sign bearer tokens.
- `JWT_EXPIRES_IN`: access token lifetime, for example `1h`.
- `PORT`: API port.
- `UPLOAD_DIR`: local private upload directory.
- `MAX_FILE_SIZE_MB`: maximum upload size, default example is `5`.

Do not commit real secrets. `.env.example` contains local dummy values only.

## Demo Credentials

All seeded users use this password:

```text
Password123!
```

Users:

- `parent@example.com` / Parent
- `tutor@example.com` / Tutor
- `second-tutor@example.com` / Tutor

Seed data includes two tutor profiles, two tuition cases owned by the parent, one active case invitation, and one sample tutor profile document metadata row.

## Swagger

Swagger/OpenAPI is available after starting the API:

```text
http://localhost:3001/docs
```

Protected endpoints use JWT bearer auth. Log in with `POST /auth/login`, then send:

```text
Authorization: Bearer <accessToken>
```

`POST /auth/logout` is client-managed and returns `{ "ok": true }`; clients should discard the token.

## Access Control

Authorization is enforced server-side through `AccessControlService`.

- Parents can access and edit only their own tuition cases.
- Tutors can access only cases where they have an active invitation.
- Only parent case owners can invite or revoke tutors.
- Parents can browse tutor profiles.
- Tutors can view and edit only their own profile.
- Document listing and download re-check the same server-side authorization rules.

Frontend permission checks should only improve UX; they are not a security boundary.

## Upload Security

Documents are stored through a storage service abstraction with a local filesystem implementation for MVP.

- Allowed file types: `pdf`, `docx`, `png`, `jpg`, `jpeg`.
- Max file size comes from `MAX_FILE_SIZE_MB`.
- Original filenames are sanitized before being stored as metadata.
- Storage keys are random and are not returned by the API.
- Filesystem paths are never exposed in API responses.
- Download requests always re-check authorization before reading from storage.

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

## Pull Request Checks

GitHub Actions runs `.github/workflows/pr-check.yml` on pull requests targeting `main` or `master`.

The workflow installs dependencies with the lockfile package manager, generates Prisma Client when Prisma is present, and runs available backend `lint`, `typecheck`, `build`, and `test` scripts. Frontend checks run separately for `apps/web` when that package exists. CI uses safe dummy environment variables and does not deploy or require production secrets.

## Repository Layout

```text
apps/
  api/        NestJS backend and Prisma schema
docs/         Planning and delivery notes
```
