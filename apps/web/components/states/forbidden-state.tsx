export function ForbiddenState() {
  return (
    <div className="rounded-md border border-slate-300 bg-white p-6">
      <h2 className="text-sm font-semibold text-ink">Access denied</h2>
      <p className="mt-1 text-sm text-slate-600">
        Your account does not have permission to view this page.
      </p>
    </div>
  );
}
