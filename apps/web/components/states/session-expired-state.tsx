"use client";

import Link from "next/link";

export function SessionExpiredState() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-sm font-semibold text-amber-950">Session expired</h2>
      <p className="mt-1 text-sm text-amber-800">
        Sign in again to continue.
      </p>
      <Link
        className="mt-4 inline-flex rounded-md bg-amber-900 px-3 py-2 text-sm font-medium text-white"
        href="/login"
      >
        Sign in
      </Link>
    </div>
  );
}
