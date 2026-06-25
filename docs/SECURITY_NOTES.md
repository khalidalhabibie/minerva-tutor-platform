# Security Notes

## Authentication

- Hash passwords with bcrypt before storing them.
- Never store or log plaintext passwords.
- Use JWT bearer tokens for authenticated API requests.
- Keep JWT secret and expiry in environment variables.
- Keep seeded demo passwords documented for reviewers, but never reuse real passwords.

## Authorization

- Enforce authorization on the server for every protected endpoint.
- Do not rely on frontend route guards or hidden buttons for security.
- Check ownership for parent case operations.
- Check active invitation status for tutor case access.
- Re-check authorization on every document download, even if the document was listed earlier.
- Revoke tutor access immediately when an invitation is revoked.

## Error Handling

- Do not return stack traces or raw internal errors to clients.
- Use stable error messages that explain the issue without exposing internals.
- Log server errors privately with enough context for debugging.
- Prefer `404` when revealing whether a resource exists would leak data.

## File Uploads

- Validate MIME type and file extension.
- Enforce a maximum file size.
- Use safe random storage keys rather than user-provided filenames.
- Store original filenames only as metadata for display.
- Do not expose filesystem paths in API responses.
- Keep storage behind a service interface so local disk can later be replaced with object storage.
- Stream downloads through an authorized API route instead of serving private files directly.

## Database and Data Exposure

- Never expose password hashes, storage paths, or sensitive internal fields.
- Use explicit DTOs for API responses.
- Validate and transform request DTOs before they reach business logic.
- Scope queries by the current user and role.
- Use database constraints for unique email addresses and duplicate invitation prevention.

## Frontend Security Responsibilities

- Store JWTs carefully and consistently.
- Handle `401` by clearing auth state and sending the user to login.
- Handle `403` with a clear access-denied state.
- Use permission-aware UI for usability, while assuming the API remains the source of truth.
- Avoid rendering raw server error details.

## MVP Limitations to Document

- Logout is token discard only unless token revocation is added.
- Local file storage is acceptable for MVP but not production-ready by itself.
- JWT refresh token rotation is out of scope unless time permits.
- Virus scanning for uploads is out of scope for MVP but should be noted as a production requirement.
