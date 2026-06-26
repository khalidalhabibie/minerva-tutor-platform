"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useCurrentUser, useLogout } from "@/lib/auth-hooks";

export function AppShell({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-panel">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link className="text-sm font-semibold text-ink" href="/">
            Minerva
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user?.role === "PARENT" ? (
              <>
                <Link
                  className="text-slate-700 hover:text-ink"
                  href="/parent/cases"
                >
                  Cases
                </Link>
                <Link
                  className="text-slate-700 hover:text-ink"
                  href="/parent/tutors"
                >
                  Tutors
                </Link>
              </>
            ) : null}
            {user?.role === "TUTOR" ? (
              <>
                <Link className="text-slate-700 hover:text-ink" href="/tutor/cases">
                  Invited cases
                </Link>
                <Link className="text-slate-700 hover:text-ink" href="/tutor/profile">
                  Profile
                </Link>
              </>
            ) : null}
            <Link className="text-slate-700 hover:text-ink" href="/docs">
              Docs
            </Link>
            <button
              className="rounded-md border border-line px-3 py-1.5 text-slate-700 hover:bg-panel"
              onClick={() => logout.mutate()}
              type="button"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
