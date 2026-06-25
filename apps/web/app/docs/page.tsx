const sections = [
  {
    title: "Frontend Architecture",
    body: "The web app uses Next.js App Router with client-side auth state, TanStack Query for server state, React Hook Form for forms, and Tailwind CSS for styling. Feature pages are intentionally minimal until the backend workflows are connected."
  },
  {
    title: "API Client",
    body: "The API client lives in lib/api-client.ts. It centralizes base URL handling, JSON requests, bearer token headers, response parsing, and normalized errors."
  },
  {
    title: "Auth Flow",
    body: "Login calls POST /auth/login, stores the JWT in localStorage, caches the current user, and redirects by role. /auth/me is loaded through TanStack Query. Logout calls POST /auth/logout and clears local auth state."
  },
  {
    title: "Access Control Handling",
    body: "Protected UI routes use AuthGate and role checks for UX. Server-side authorization remains the source of truth, so every protected API request still depends on backend guards and AccessControlService."
  },
  {
    title: "Upload and Download Handling",
    body: "The current frontend has no upload screens yet. Future upload forms should send multipart requests to the document endpoints and handle 400, 401, 403, and 413 states explicitly. Downloads should use authorized API URLs rather than direct storage paths."
  },
  {
    title: "Known Limitations",
    body: "JWT storage uses localStorage for MVP simplicity. Refresh tokens, SSR auth cookies, full feature pages, and upload UI will be added later if required."
  }
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-panel px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-ink">Frontend docs</h1>
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
