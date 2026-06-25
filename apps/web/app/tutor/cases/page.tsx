"use client";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { EmptyState } from "@/components/states/empty-state";

export default function TutorCasesPage() {
  return (
    <AuthGate allowedRoles={["TUTOR"]}>
      <AppShell>
        <h1 className="text-xl font-semibold text-ink">Invited cases</h1>
        <div className="mt-4">
          <EmptyState
            title="Invited case workflow is not built yet"
            detail="The protected tutor area is ready for the next feature task."
          />
        </div>
      </AppShell>
    </AuthGate>
  );
}
