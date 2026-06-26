"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { CaseForm } from "@/components/parent/case-form";
import { ErrorState } from "@/components/states/error-state";
import { apiClient, CaseFormInput } from "@/lib/api-client";

export default function NewCasePage() {
  const router = useRouter();
  const createCase = useMutation({
    mutationFn: (input: CaseFormInput) => apiClient.createCase(input),
    onSuccess: (tuitionCase) => {
      router.replace(`/parent/cases/${tuitionCase.id}`);
    }
  });

  return (
    <AuthGate allowedRoles={["PARENT"]}>
      <AppShell>
        <Link className="text-sm text-slate-600 hover:text-ink" href="/parent/cases">
          Back to cases
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-ink">Create case</h1>
        <div className="mt-5">
          <CaseForm
            isSubmitting={createCase.isPending}
            onSubmit={(input) => createCase.mutate(input)}
            submitLabel="Create case"
          />
        </div>
        {createCase.error ? (
          <div className="mt-4">
            <ErrorState title="Could not create case" detail={createCase.error.message} />
          </div>
        ) : null}
      </AppShell>
    </AuthGate>
  );
}
