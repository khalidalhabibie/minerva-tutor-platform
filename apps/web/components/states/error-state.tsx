export function ErrorState({
  title = "Something went wrong",
  detail
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6">
      <h2 className="text-sm font-semibold text-red-900">{title}</h2>
      {detail ? <p className="mt-1 text-sm text-red-700">{detail}</p> : null}
    </div>
  );
}
