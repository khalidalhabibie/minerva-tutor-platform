"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { ApiResult } from "@/components/parent/api-result";
import { DocumentList } from "@/components/parent/document-list";
import { apiClient } from "@/lib/api-client";

export default function TutorProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const profileId = params.id;
  const profile = useQuery({
    queryKey: ["parent", "tutor", profileId],
    queryFn: () => apiClient.getTutorProfile(profileId)
  });
  const documents = useQuery({
    queryKey: ["parent", "tutor", profileId, "documents"],
    queryFn: () => apiClient.listTutorProfileDocuments(profileId)
  });

  return (
    <AuthGate allowedRoles={["PARENT"]}>
      <AppShell>
        <Link className="text-sm text-slate-600 hover:text-ink" href="/parent/tutors">
          Back to tutors
        </Link>
        <div className="mt-5">
          <ApiResult error={profile.error} isLoading={profile.isLoading}>
            {profile.data ? (
              <div className="grid gap-5">
                <section className="rounded-md border border-line bg-white p-5">
                  <h1 className="text-xl font-semibold text-ink">
                    {profile.data.displayName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Tutor user ID:{" "}
                    <span className="font-mono text-xs text-slate-700">
                      {profile.data.userId}
                    </span>
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-700">
                        Qualifications
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {profile.data.qualifications}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-700">
                        Experiences
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {profile.data.experiences}
                      </p>
                    </div>
                  </div>
                </section>
                <ApiResult error={documents.error} isLoading={documents.isLoading}>
                  <DocumentList documents={documents.data ?? []} />
                </ApiResult>
              </div>
            ) : null}
          </ApiResult>
        </div>
      </AppShell>
    </AuthGate>
  );
}
