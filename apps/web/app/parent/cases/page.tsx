"use client";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { EmptyState } from "@/components/states/empty-state";

export default function ParentCasesPage() {
  return (
    <AuthGate allowedRoles={["PARENT"]}>
      <AppShell>
        <h1 className="text-xl font-semibold text-ink">Parent cases</h1>
        <div className="mt-4">
          <EmptyState
            title="Case management is not built yet"
            detail="The frontend shell is ready; case workflows will be added incrementally."
          />
        </div>
      </AppShell>
    </AuthGate>
  );
}
