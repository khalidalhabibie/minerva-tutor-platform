# Implementation Plan

## Goal

Build a small, secure tuition marketplace MVP as a monorepo with a NestJS API, PostgreSQL database via Prisma, and a Next.js App Router frontend.

The project should be implemented incrementally. Each step should leave the application in a working, reviewable state.

## Target Architecture

- `apps/api`: NestJS API, Prisma, Swagger/OpenAPI, JWT auth.
- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, React Hook Form.
- `packages/*`: shared TypeScript types or utilities only if duplication becomes meaningful.
- PostgreSQL for persistence.
- Local file storage abstraction for MVP, with storage keys hidden from clients.

## Phased Delivery

### Phase 1: Project Foundation

- Create monorepo structure.
- Add TypeScript, linting, formatting, and basic scripts.
- Add NestJS API app and Next.js web app.
- Add environment variable examples and setup notes.
- Add PostgreSQL and Prisma configuration.

Exit criteria:
- API and web apps start locally.
- Database connection can be validated.
- README documents setup commands.

### Phase 2: Data Model and Auth

- Define Prisma models for users, tuition cases, case invitations, case documents, tutor profiles, and tutor documents.
- Add seeded demo users for Parent and Tutor roles.
- Implement email/password login with bcrypt password hashing.
- Implement JWT bearer auth and current user endpoint.
- Add logout as a client-side token discard flow, documented clearly.

Exit criteria:
- Seeded users can log in.
- Protected endpoints reject unauthenticated requests.
- Swagger documents auth endpoints.

### Phase 3: Tuition Cases and Invitations

- Parent can create, list, view, and edit their own tuition cases.
- Tutor can list and view only cases where they have an active invitation.
- Parent can invite and revoke tutors for their own cases.
- Server-side authorization checks are enforced on every endpoint.

Exit criteria:
- Parent cannot access another parent's cases.
- Tutor cannot access non-invited cases.
- Revoked tutor access stops immediately.

### Phase 4: Documents

- Add safe local file storage service abstraction.
- Support validated upload, list, and download for case documents.
- Support tutor profile supporting document uploads.
- Validate allowed file types and max size.
- Generate random storage keys.
- Re-check authorization before every download.

Exit criteria:
- API responses never expose filesystem paths.
- Unauthorized users cannot list or download documents.
- Invalid file types and oversized uploads are rejected.

### Phase 5: Tutor Profiles and Directory

- Tutor can create and edit their own profile.
- Parent can browse tutor directory.
- Parent can view tutor profiles and public profile metadata.
- Keep supporting documents private unless explicitly exposed by an authorized endpoint.

Exit criteria:
- Tutors can manage only their own profile.
- Parents can browse profiles without seeing private storage details.

### Phase 6: Frontend Workflows

- Build auth screens and authenticated app shell.
- Add parent case management screens.
- Add tutor invited-case screens.
- Add invitation management.
- Add document upload/list/download UI.
- Add tutor directory and profile views.
- Add frontend docs page explaining architecture and key components.

Exit criteria:
- Frontend handles loading, empty, error, 401, and 403 states.
- Forms validate user input before submit and show API errors clearly.
- UI permission checks improve UX but do not replace API authorization.

### Phase 7: Hardening and Submission

- Add focused API tests for auth and authorization boundaries.
- Add basic frontend tests where practical.
- Review OpenAPI docs for accuracy.
- Review error responses and logging.
- Run delivery checklist before submission.

Exit criteria:
- Main assignment requirements are demonstrable.
- Known limitations are documented.
- Setup and demo credentials are easy to find.

## Non-Goals for MVP

- Payments.
- Messaging.
- Notifications.
- Production cloud storage.
- Complex search ranking.
- Admin console.
- Refresh token rotation unless time permits.

## Implementation Principles

- Enforce authorization in the API, not only in the frontend.
- Prefer simple CRUD flows with clear ownership rules.
- Keep DTOs explicit and validated.
- Return stable, client-friendly errors.
- Avoid exposing internal identifiers that are not needed by the UI.
- Keep file storage behind an interface so local storage can later be replaced.
