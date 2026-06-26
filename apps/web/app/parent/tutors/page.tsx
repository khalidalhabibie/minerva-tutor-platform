"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { ApiResult } from "@/components/parent/api-result";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { apiClient } from "@/lib/api-client";

export default function TutorDirectoryPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-6">
          <LoadingState label="Loading tutors" />
        </main>
      }
    >
      <TutorDirectoryContent />
    </Suspense>
  );
}

function TutorDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 10;
  const search = searchParams.get("search") ?? "";
  const profiles = useQuery({
    queryKey: ["parent", "tutors", { page, pageSize, search }],
    queryFn: () => apiClient.listTutorProfiles({ page, pageSize, search })
  });

  function updateSearch(value: string) {
    const next = new URLSearchParams(searchParams);
    next.set("page", "1");

    if (value) {
      next.set("search", value);
    } else {
      next.delete("search");
    }

    router.push(`/parent/tutors?${next.toString()}`);
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    router.push(`/parent/tutors?${next.toString()}`);
  }

  return (
    <AuthGate allowedRoles={["PARENT"]}>
      <AppShell>
        <h1 className="text-xl font-semibold text-ink">Tutor directory</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse tutor profiles and supporting documents.
        </p>
        <div className="mt-5 rounded-md border border-line bg-white p-4">
          <input
            className="field"
            defaultValue={search}
            onBlur={(event) => updateSearch(event.target.value)}
            placeholder="Search name, qualifications, or experiences"
          />
        </div>
        <div className="mt-5">
          <ApiResult error={profiles.error} isLoading={profiles.isLoading}>
            {profiles.data && profiles.data.data.length === 0 ? (
              <EmptyState title="No tutors found" detail="Adjust the search term." />
            ) : (
              <div className="overflow-hidden rounded-md border border-line bg-white">
                <div className="divide-y divide-line">
                  {profiles.data?.data.map((profile) => (
                    <Link
                      className="block p-4 hover:bg-panel"
                      href={`/parent/tutors/${profile.id}`}
                      key={profile.id}
                    >
                      <h2 className="text-sm font-semibold text-ink">
                        {profile.displayName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {profile.qualifications}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.experiences}
                      </p>
                    </Link>
                  ))}
                </div>
                {profiles.data ? (
                  <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-slate-600">
                    <span>
                      Page {profiles.data.pagination.page} of{" "}
                      {Math.max(profiles.data.pagination.totalPages, 1)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="rounded-md border border-line px-3 py-1.5 disabled:opacity-50"
                        disabled={page <= 1}
                        onClick={() => goToPage(page - 1)}
                        type="button"
                      >
                        Previous
                      </button>
                      <button
                        className="rounded-md border border-line px-3 py-1.5 disabled:opacity-50"
                        disabled={page >= profiles.data.pagination.totalPages}
                        onClick={() => goToPage(page + 1)}
                        type="button"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </ApiResult>
        </div>
      </AppShell>
    </AuthGate>
  );
}
