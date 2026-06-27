const sections = [
  {
    title: "Frontend Architecture",
    body: "The web app uses Next.js App Router with client-side protected pages, TanStack Query for server state, React Hook Form for forms, and Tailwind CSS for simple shared styling. Parent and tutor workflows live under role-specific route groups."
  },
  {
    title: "API Client",
    body: "lib/api-client.ts centralizes the backend base URL, JSON requests, multipart uploads, bearer token headers, response parsing, file downloads, and normalized API errors."
  },
  {
    title: "Auth Flow",
    body: "Login calls POST /auth/login, stores the JWT in localStorage, fetches /auth/me, and redirects by role. Logout calls POST /auth/logout, clears local auth state, and returns to /login."
  },
  {
    title: "Access Control Handling",
    body: "AuthGate protects frontend routes and shows session-expired or forbidden states for UX. The backend remains the authorization boundary for case access, tutor profile visibility, invitations, uploads, and downloads."
  },
  {
    title: "Parent Workflows",
    body: "Parents can list, search, filter, create, view, and edit their cases; invite or revoke tutors; upload case documents; browse tutor profiles; and download visible tutor documents."
  },
  {
    title: "Tutor Workflows",
    body: "Tutors can create or edit their own profile, upload profile documents, list invited cases, view invited case details, and upload or download documents on accessible cases."
  },
  {
    title: "Upload and Download Handling",
    body: "Upload controls send multipart form data through the API client. Downloads request /documents/:id/download with the bearer token and never use direct filesystem paths."
  },
  {
    title: "Known Limitations",
    body: "JWTs use localStorage for MVP simplicity. The UI is intentionally lean, local uploads are not durable production storage, and there are no notifications, password reset, or end-to-end browser tests yet."
  }
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-panel px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-ink">Frontend docs</h1>
        <p className="mt-2 text-sm text-slate-600">
          Architecture notes for the Minerva tutor marketplace frontend.
        </p>
        <div className="mt-6 grid gap-4">
          {sections.map((section) => (
            <section
              className="rounded-md border border-line bg-white p-5"
              key={section.title}
            >
              <h2 className="text-base font-semibold text-ink">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
