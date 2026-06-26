# minerva-tutor-platform

Minerva is a full-stack tuition marketplace take-home project. It supports parent and tutor roles, JWT authentication, tutor profiles, parent-owned tuition cases, tutor invitations, and secure local document upload/download for the MVP.

## Tech Stack

- Monorepo with pnpm workspaces
- Backend: NestJS, TypeScript, Prisma, PostgreSQL, Swagger/OpenAPI
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, React Hook Form
- Auth: email/password login, bcrypt password hashes, JWT bearer tokens
- Uploads: local storage abstraction with safe generated storage keys

## Local Setup

Prerequisites: Node.js 20+, pnpm 9+, Docker.

```sh
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
pnpm dev:api
pnpm dev:web
```

The API runs on `http://localhost:3001`. The frontend runs on `http://localhost:3000`.

If you run Prisma commands without a local `.env`, export `DATABASE_URL` in the shell first.

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: secret used to sign JWTs. Use a strong secret outside local development.
- `JWT_EXPIRES_IN`: token lifetime, for example `1h`.
- `PORT`: backend port, usually `3001`.
- `UPLOAD_DIR`: private local upload directory.
- `MAX_FILE_SIZE_MB`: maximum upload size, default example is `5`.
- `NEXT_PUBLIC_API_BASE_URL`: frontend API URL, usually `http://localhost:3001`.

## Seeded Users

All seeded users use `Password123!`.

- `parent@example.com` with role `PARENT`
- `tutor@example.com` with role `TUTOR`
- `second-tutor@example.com` with role `TUTOR`

Seed data includes tutor profiles, parent cases, and an active invitation.

## Main Demo Flow

1. Login as `tutor@example.com`.
2. Create or edit the tutor profile at `/tutor/profile`.
3. Upload a tutor profile document.
4. Logout and login as `parent@example.com`.
5. Browse `/parent/tutors` and view the tutor profile.
6. Create a case at `/parent/cases/new`.
7. Invite the tutor from the case detail page.
8. Upload a case document.
9. Logout and login as the tutor.
10. Open `/tutor/cases`, view the invited case, and download the case document.

## Documentation URLs

- Backend Swagger/OpenAPI: `http://localhost:3001/docs`
- Frontend architecture docs: `http://localhost:3000/docs`

## Useful Scripts

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

## Auth Tradeoffs

JWTs are stored in browser `localStorage` for MVP simplicity. Logout is client-managed and clears the token; the backend returns `{ ok: true }`. This is acceptable for a small take-home but is not the strongest production posture. A production version should consider secure, HTTP-only cookies, refresh-token rotation, token revocation, and CSRF strategy based on the chosen auth model.

## Authorization Rules

Server-side authorization is enforced in the API and must not rely on frontend route checks.

- Parents can create cases and can list/view/edit only their own cases.
- Tutors can list/view only cases where they have an active invitation.
- Only the parent case owner can invite or revoke tutors.
- Parents can browse and view tutor profiles.
- Tutors can create/edit/view only their own profile.
- Case document access follows case access.
- Tutor profile document access follows tutor profile visibility.
- Document downloads always re-check authorization.

## File Upload Security

- Allowed file types: `pdf`, `docx`, `png`, `jpg`, `jpeg`.
- Max size is controlled by `MAX_FILE_SIZE_MB`.
- Original filenames are sanitized.
- Storage keys are random and not exposed to clients.
- API responses do not include filesystem paths.
- Downloads stream through the API after authorization checks.
- The local storage service is abstracted so S3 or Supabase Storage can replace it later.

## Deployment Notes

This project does not include CD or production deployment automation. For deployment, run PostgreSQL as a managed service, set real environment variables, run Prisma migrations during release, use persistent object storage for uploads, serve the NestJS API and Next.js app behind HTTPS, and configure CORS/cookie/auth settings for the deployed domains.

## Known Limitations

- JWT auth is intentionally simple and client-managed.
- Local file storage is suitable for MVP development only.
- The UI is functional and intentionally plain; it does not include advanced filtering, optimistic updates, or rich profile/case media.
- There is no email delivery, password reset, invitation notification, or admin panel.
- Seeded document metadata can reference demo rows; real downloads are validated with uploaded files.

## What I Would Improve With More Time

- Move uploads to durable object storage with virus scanning.
- Add end-to-end browser tests for the full demo flow.
- Add refresh tokens or cookie-based auth.
- Add richer tutor search and parent/tutor messaging.
- Add audit logs for invitations and document downloads.
- Add production-ready observability, rate limiting, and structured logging.

## Pull Request Checks

GitHub Actions runs `.github/workflows/pr-check.yml` on pull requests targeting `main` or `master`. It runs backend and frontend checks separately with safe dummy environment variables and does not deploy, release, or publish images.
