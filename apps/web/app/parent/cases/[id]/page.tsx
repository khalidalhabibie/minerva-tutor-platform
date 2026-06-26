"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { ApiResult } from "@/components/parent/api-result";
import { CaseForm } from "@/components/parent/case-form";
import { DocumentList } from "@/components/parent/document-list";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { apiClient, CaseFormInput } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const queryClient = useQueryClient();
  const [tutorId, setTutorId] = useState("");
  const caseQuery = useQuery({
    queryKey: ["parent", "case", caseId],
    queryFn: () => apiClient.getCase(caseId)
  });
  const invitations = useQuery({
    queryKey: ["parent", "case", caseId, "invitations"],
    queryFn: () => apiClient.listCaseInvitations(caseId)
  });
  const documents = useQuery({
    queryKey: ["parent", "case", caseId, "documents"],
    queryFn: () => apiClient.listCaseDocuments(caseId)
  });
  const updateCase = useMutation({
    mutationFn: (input: CaseFormInput) => apiClient.updateCase(caseId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["parent", "case", caseId] });
      await queryClient.invalidateQueries({ queryKey: ["parent", "cases"] });
    }
  });
  const invite = useMutation({
    mutationFn: () => apiClient.inviteTutor(caseId, tutorId),
    onSuccess: async () => {
      setTutorId("");
      await queryClient.invalidateQueries({
        queryKey: ["parent", "case", caseId, "invitations"]
      });
    }
  });
  const revoke = useMutation({
    mutationFn: (targetTutorId: string) => apiClient.revokeTutor(caseId, targetTutorId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["parent", "case", caseId, "invitations"]
      });
    }
  });
  const upload = useMutation({
    mutationFn: (file: File) => apiClient.uploadCaseDocument(caseId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["parent", "case", caseId, "documents"]
      });
    }
  });

  return (
    <AuthGate allowedRoles={["PARENT"]}>
      <AppShell>
        <Link className="text-sm text-slate-600 hover:text-ink" href="/parent/cases">
          Back to cases
        </Link>
        <div className="mt-5">
          <ApiResult error={caseQuery.error} isLoading={caseQuery.isLoading}>
            {caseQuery.data ? (
              <div className="grid gap-5">
                <section className="rounded-md border border-line bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-semibold text-ink">
                        {caseQuery.data.title}
                      </h1>
                      <p className="mt-1 text-sm text-slate-600">
                        {caseQuery.data.subject} · {caseQuery.data.level} ·{" "}
                        {caseQuery.data.location}
                      </p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-ink">
                        {formatMoney(caseQuery.data.budgetPerHour)}
                      </p>
                      <p>
                        {caseQuery.data.status} · {formatDate(caseQuery.data.createdAt)}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-base font-semibold text-ink">Edit case</h2>
                  <CaseForm
                    caseRecord={caseQuery.data}
                    isSubmitting={updateCase.isPending}
                    onSubmit={(input) => updateCase.mutate(input)}
                    submitLabel="Save changes"
                  />
                  {updateCase.error ? (
                    <div className="mt-4">
                      <ErrorState
                        title="Could not update case"
                        detail={updateCase.error.message}
                      />
                    </div>
                  ) : null}
                </section>

                <section className="rounded-md border border-line bg-white p-5">
                  <h2 className="text-base font-semibold text-ink">Invitations</h2>
                  <div className="mt-4 flex gap-2">
                    <input
                      className="field"
                      onChange={(event) => setTutorId(event.target.value)}
                      placeholder="Tutor user id"
                      value={tutorId}
                    />
                    <button
                      className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      disabled={!tutorId || invite.isPending}
                      onClick={() => invite.mutate()}
                      type="button"
                    >
                      Invite
                    </button>
                  </div>
                  {invite.error ? (
                    <div className="mt-4">
                      <ErrorState title="Invite failed" detail={invite.error.message} />
                    </div>
                  ) : null}
                  <div className="mt-4">
                    <ApiResult
                      error={invitations.error}
                      isLoading={invitations.isLoading}
                    >
                      {invitations.data && invitations.data.length === 0 ? (
                        <EmptyState title="No invitations" />
                      ) : (
                        <div className="divide-y divide-line">
                          {invitations.data?.map((invitation) => (
                            <div
                              className="flex items-center justify-between py-3 text-sm"
                              key={invitation.id}
                            >
                              <div>
                                <p className="font-medium text-ink">
                                  {invitation.tutorId}
                                </p>
                                <p className="text-slate-500">
                                  {invitation.revokedAt
                                    ? `Revoked ${formatDate(invitation.revokedAt)}`
                                    : "Active"}
                                </p>
                              </div>
                              <button
                                className="rounded-md border border-line px-3 py-1.5 text-slate-700 hover:bg-panel disabled:opacity-60"
                                disabled={Boolean(invitation.revokedAt) || revoke.isPending}
                                onClick={() => revoke.mutate(invitation.tutorId)}
                                type="button"
                              >
                                Revoke
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ApiResult>
                  </div>
                </section>

                <ApiResult error={documents.error} isLoading={documents.isLoading}>
                  <DocumentList
                    documents={documents.data ?? []}
                    isUploading={upload.isPending}
                    onUpload={(file) => upload.mutate(file)}
                    queryKey={["parent", "case", caseId, "documents"]}
                    uploadError={upload.error}
                  />
                </ApiResult>
              </div>
            ) : null}
          </ApiResult>
        </div>
      </AppShell>
    </AuthGate>
  );
}
