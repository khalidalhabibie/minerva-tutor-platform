export function EmptyState({
  title = "Nothing here yet",
  detail
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-line bg-white p-6">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {detail ? <p className="mt-1 text-sm text-slate-600">{detail}</p> : null}
    </div>
  );
}
