"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { ApiResult } from "@/components/parent/api-result";
import { DocumentList } from "@/components/parent/document-list";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";

export default function TutorCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const queryClient = useQueryClient();
  const caseQuery = useQuery({
    queryKey: ["tutor", "case", caseId],
    queryFn: () => apiClient.getCase(caseId)
  });
  const documents = useQuery({
    queryKey: ["tutor", "case", caseId, "documents"],
    queryFn: () => apiClient.listCaseDocuments(caseId)
  });
  const upload = useMutation({
    mutationFn: (file: File) => apiClient.uploadCaseDocument(caseId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tutor", "case", caseId, "documents"]
      });
    }
  });

  return (
    <AuthGate allowedRoles={["TUTOR"]}>
      <AppShell>
        <Link className="text-sm text-slate-600 hover:text-ink" href="/tutor/cases">
          Back to invited cases
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

                <ApiResult error={documents.error} isLoading={documents.isLoading}>
                  <DocumentList
                    documents={documents.data ?? []}
                    isUploading={upload.isPending}
                    onUpload={(file) => upload.mutate(file)}
                    queryKey={["tutor", "case", caseId, "documents"]}
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
