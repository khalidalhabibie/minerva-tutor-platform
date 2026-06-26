"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatBytes, formatDate } from "@/lib/format";
import { DocumentMetadata } from "@/lib/types";
import { EmptyState } from "../states/empty-state";
import { ErrorState } from "../states/error-state";

export function DocumentList({
  documents,
  uploadError,
  isUploading,
  onUpload,
  queryKey
}: {
  documents: DocumentMetadata[];
  uploadError?: Error | null;
  isUploading?: boolean;
  onUpload?: (file: File) => void;
  queryKey?: readonly unknown[];
}) {
  const queryClient = useQueryClient();
  const download = useMutation({
    mutationFn: async (document: DocumentMetadata) => {
      const blob = await apiClient.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalFilename;
      link.click();
      window.URL.revokeObjectURL(url);
      if (queryKey) {
        await queryClient.invalidateQueries({ queryKey });
      }
    }
  });

  return (
    <section className="rounded-md border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Documents</h2>
        {onUpload ? (
          <label className="cursor-pointer rounded-md border border-line px-3 py-2 text-sm text-slate-700 hover:bg-panel">
            {isUploading ? "Uploading..." : "Upload"}
            <input
              className="sr-only"
              disabled={isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) {
                  onUpload(file);
                }
              }}
              type="file"
            />
          </label>
        ) : null}
      </div>
      {uploadError ? (
        <div className="mt-4">
          <ErrorState title="Upload failed" detail={uploadError.message} />
        </div>
      ) : null}
      {download.error ? (
        <div className="mt-4">
          <ErrorState title="Download failed" detail={download.error.message} />
        </div>
      ) : null}
      <div className="mt-4">
        {documents.length === 0 ? (
          <EmptyState title="No documents" detail="Uploaded files will appear here." />
        ) : (
          <div className="divide-y divide-line">
            {documents.map((document) => (
              <div
                className="flex items-center justify-between gap-4 py-3"
                key={document.id}
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {document.originalFilename}
                  </p>
                  <p className="text-xs text-slate-500">
                    {document.mimeType} · {formatBytes(document.size)} ·{" "}
                    {formatDate(document.createdAt)}
                  </p>
                </div>
                <button
                  className="rounded-md border border-line px-3 py-1.5 text-sm text-slate-700 hover:bg-panel"
                  onClick={() => download.mutate(document)}
                  type="button"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
