# minerva-tutor-platform

Minerva is a full-stack tuition marketplace take-home project. It supports parent and tutor roles, authenticated case management, tutor profiles, tutor invitations, and authorized document upload/download.

## Tech Stack

- Monorepo: pnpm workspaces
- Backend: NestJS, TypeScript, Prisma, PostgreSQL, Swagger/OpenAPI
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, React Hook Form
- Auth: email/password login, bcrypt password hashing, JWT bearer tokens
- Files: safe local storage abstraction for MVP uploads

## Local Setup

Prerequisites: Node.js 20+, pnpm 9+, and Docker.

```sh
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```

Run the API and frontend in separate terminals:

```sh
pnpm dev:api
```

```sh
pnpm dev:web
```

Local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger/OpenAPI docs: `http://localhost:3001/docs`
- Frontend docs page: `http://localhost:3000/docs`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: secret used to sign JWTs.
- `JWT_EXPIRES_IN`: access token lifetime, for example `1h`.
- `PORT`: backend port, usually `3001`.
- `UPLOAD_DIR`: private local upload directory.
- `MAX_FILE_SIZE_MB`: upload size limit, default example is `5`.
- `NEXT_PUBLIC_API_BASE_URL`: frontend API base URL, usually `http://localhost:3001`.

Do not commit real secrets. `.env.example` contains local development values only.

## Database Migration and Seed

```sh
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```

If Prisma cannot find `DATABASE_URL`, export it in the shell before running migration or seed commands.

## Demo Credentials

All seeded users use this password:

```text
Password123!
```

- `parent@example.com` / Parent
- `tutor@example.com` / Tutor
- `second-tutor@example.com` / Tutor

Seed data includes tutor profiles, parent-owned tuition cases, and an active tutor invitation.

## Deployment URLs

- Deployed frontend: `<deployed-frontend-url>`
- Deployed backend API: `<deployed-backend-url>`
- Swagger/OpenAPI docs: `<deployed-backend-url>/docs`
- Frontend docs page: `<deployed-frontend-url>/docs`

## Auth Choice and Tradeoffs

The MVP uses email/password login with bcrypt password hashes and JWT bearer tokens. The frontend stores the access token in `localStorage`; logout is client-managed by clearing that token.

This is simple and practical for the take-home. For production, I would use a stronger session strategy such as HTTP-only secure cookies or refresh tokens, add token revocation, rate limiting, password reset, and stricter deployment-specific security settings.

## Authorization Rules

Authorization is enforced server-side. Frontend role checks are only for UX.

- Parents can create tuition cases.
- Parents can list, view, edit, invite tutors to, revoke tutors from, and manage documents only for their own cases.
- Tutors can list and view only cases where they have an active invitation.
- Parents can browse and view tutor profiles.
- Tutors can create, view, and edit only their own profile.
- Tutor profile documents are uploadable by the owning tutor and visible to parents.
- Case document access follows case access.
- Every document download re-checks authorization.

## Document Upload and Download Security

- Allowed file types: `pdf`, `docx`, `png`, `jpg`, `jpeg`.
- File size is limited by `MAX_FILE_SIZE_MB`.
- Original filenames are sanitized.
- Storage keys are random.
- API responses do not expose storage keys or filesystem paths.
- Local storage paths are resolved defensively to prevent path traversal.
- Downloads are served through the API after authorization checks.
- The storage service is abstracted so local storage can later be replaced by S3, Supabase Storage, or similar.

## Known Limitations

- JWT storage in `localStorage` is acceptable for this MVP but not ideal for production.
- Local file storage is not durable production storage.
- The UI is intentionally simple and focuses on the required workflows.
- There is no email delivery, password reset, tutor availability, messaging, notification, or payment workflow.
- There are backend unit tests, but no browser end-to-end test suite yet.
- Deployment configuration is documented but not automated.

## What I Would Improve With More Time

- Add end-to-end tests for the complete parent/tutor demo flow.
- Move uploads to managed object storage with virus scanning.
- Add production auth hardening: refresh tokens or secure cookies, revocation, rate limits, and password reset.
- Make CORS origins and deployment settings environment-driven.
- Add richer tutor search, invitation notifications, and audit logs for document downloads.
- Improve UI polish and accessibility testing.

## Useful Commands

```sh
pnpm dev:api
pnpm dev:web
pnpm build
pnpm build:web
pnpm test
pnpm lint
pnpm lint:web
pnpm typecheck:web
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```
