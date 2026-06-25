# Delivery Checklist

## Repository

- [ ] Monorepo structure is clear.
- [ ] Backend and frontend setup commands are documented.
- [ ] Environment variables are documented with safe example values.
- [ ] No generated secrets are committed.
- [ ] README includes demo credentials and local startup steps.

## Backend

- [ ] NestJS API starts successfully.
- [ ] Prisma migrations are included.
- [ ] Seed script creates demo Parent and Tutor users.
- [ ] Swagger/OpenAPI docs are available.
- [ ] Auth endpoints support login, logout, and current user.
- [ ] Passwords are hashed with bcrypt.
- [ ] JWT bearer authentication protects private routes.
- [ ] Validation is applied to request DTOs.
- [ ] API errors do not leak stack traces.

## Authorization

- [ ] Parent can create, list, view, and edit only own cases.
- [ ] Tutor can list and view only cases with active invitations.
- [ ] Parent can invite tutors only to own cases.
- [ ] Parent can revoke tutor invitations.
- [ ] Revoked tutors lose access to the case and documents.
- [ ] Document downloads re-check authorization.
- [ ] Server-side checks exist for every protected action.

## Documents

- [ ] Case document upload works for authorized users.
- [ ] Case document list returns metadata only.
- [ ] Case document download streams through the API.
- [ ] Tutor supporting document upload works for tutors.
- [ ] File type validation is enforced.
- [ ] Max file size validation is enforced.
- [ ] API responses do not expose filesystem paths.
- [ ] Storage keys are safe and random.

## Tutor Profiles

- [ ] Tutor can create and edit own profile.
- [ ] Tutor cannot edit another tutor profile.
- [ ] Parent can browse tutor directory.
- [ ] Parent can view tutor public profile details.
- [ ] Private document metadata is not exposed through public profile endpoints.

## Frontend

- [ ] Next.js App Router frontend starts successfully.
- [ ] Auth state is handled consistently.
- [ ] Parent case workflows are usable.
- [ ] Tutor invited-case workflows are usable.
- [ ] Invitation management UI is available for parents.
- [ ] Document upload, list, and download flows are usable.
- [ ] Tutor directory and profile screens are available.
- [ ] Frontend docs page explains architecture and key components.
- [ ] Loading states are implemented.
- [ ] Empty states are implemented.
- [ ] Error states are implemented.
- [ ] `401` states clear auth and redirect to login.
- [ ] `403` states show access denied without retry loops.

## Verification

- [ ] API tests cover login and current user.
- [ ] API tests cover parent ownership boundaries.
- [ ] API tests cover tutor invitation boundaries.
- [ ] API tests cover revoked invitation access.
- [ ] API tests cover document authorization.
- [ ] File upload validation is tested.
- [ ] Main frontend flows are manually verified.
- [ ] Swagger docs match implemented behavior.

## Submission Notes

- [ ] Known limitations are documented.
- [ ] Tradeoffs are explained briefly.
- [ ] Demo credentials are included.
- [ ] Reviewer can run the app from a fresh checkout.
