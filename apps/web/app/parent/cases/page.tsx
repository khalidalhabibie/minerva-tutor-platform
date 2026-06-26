"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { ApiResult } from "@/components/parent/api-result";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import { TuitionCaseStatus } from "@/lib/types";

const statuses: Array<TuitionCaseStatus | ""> = ["", "OPEN", "MATCHED", "CLOSED"];

export default function ParentCasesPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-6">
          <LoadingState label="Loading cases" />
        </main>
      }
    >
      <ParentCasesContent />
    </Suspense>
  );
}

function ParentCasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 10;
  const filters = {
    page,
    pageSize,
    search: searchParams.get("search") ?? "",
    subject: searchParams.get("subject") ?? "",
    level: searchParams.get("level") ?? "",
    status: (searchParams.get("status") ?? "") as TuitionCaseStatus | ""
  };
  const cases = useQuery({
    queryKey: ["parent", "cases", filters],
    queryFn: () => apiClient.listCases(filters)
  });

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    next.set("page", "1");

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    router.push(`/parent/cases?${next.toString()}`);
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    router.push(`/parent/cases?${next.toString()}`);
  }

  return (
    <AuthGate allowedRoles={["PARENT"]}>
      <AppShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Parent cases</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage tuition cases, invitations, and case documents.
            </p>
          </div>
          <Link
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white"
            href="/parent/cases/new"
          >
            New case
          </Link>
        </div>

        <section className="mt-5 grid gap-3 rounded-md border border-line bg-white p-4 md:grid-cols-4">
          <input
            className="field"
            defaultValue={filters.search}
            onBlur={(event) => updateFilter("search", event.target.value)}
            placeholder="Search title"
          />
          <input
            className="field"
            defaultValue={filters.subject}
            onBlur={(event) => updateFilter("subject", event.target.value)}
            placeholder="Subject"
          />
          <input
            className="field"
            defaultValue={filters.level}
            onBlur={(event) => updateFilter("level", event.target.value)}
            placeholder="Level"
          />
          <select
            className="field"
            onChange={(event) => updateFilter("status", event.target.value)}
            value={filters.status}
          >
            {statuses.map((status) => (
              <option key={status || "all"} value={status}>
                {status || "All statuses"}
              </option>
            ))}
          </select>
        </section>

        <div className="mt-5">
          <ApiResult error={cases.error} isLoading={cases.isLoading}>
            {cases.data && cases.data.data.length === 0 ? (
              <EmptyState
                title="No cases found"
                detail="Create a case or adjust the filters."
              />
            ) : (
              <div className="overflow-hidden rounded-md border border-line bg-white">
                <div className="divide-y divide-line">
                  {cases.data?.data.map((tuitionCase) => (
                    <Link
                      className="block p-4 hover:bg-panel"
                      href={`/parent/cases/${tuitionCase.id}`}
                      key={tuitionCase.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-ink">
                            {tuitionCase.title}
                          </h2>
                          <p className="mt-1 text-sm text-slate-600">
                            {tuitionCase.subject} · {tuitionCase.level} ·{" "}
                            {tuitionCase.location}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium text-ink">
                            {formatMoney(tuitionCase.budgetPerHour)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {tuitionCase.status} · {formatDate(tuitionCase.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {cases.data ? (
                  <Pagination
                    page={cases.data.pagination.page}
                    totalPages={cases.data.pagination.totalPages}
                    onPage={goToPage}
                  />
                ) : null}
              </div>
            )}
          </ApiResult>
        </div>
      </AppShell>
    </AuthGate>
  );
}

function Pagination({
  page,
  totalPages,
  onPage
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-slate-600">
      <span>
        Page {page} of {Math.max(totalPages, 1)}
      </span>
      <div className="flex gap-2">
        <button
          className="rounded-md border border-line px-3 py-1.5 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          type="button"
        >
          Previous
        </button>
        <button
          className="rounded-md border border-line px-3 py-1.5 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
