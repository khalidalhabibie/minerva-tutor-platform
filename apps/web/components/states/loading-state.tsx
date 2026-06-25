export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-6 text-sm text-slate-600">
      {label}...
    </div>
  );
}
