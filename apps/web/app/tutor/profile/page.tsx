"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { ApiResult } from "@/components/parent/api-result";
import { DocumentList } from "@/components/parent/document-list";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import { TutorProfileForm } from "@/components/tutor/tutor-profile-form";
import { apiClient, TutorProfileFormInput } from "@/lib/api-client";

export default function TutorProfilePage() {
  const queryClient = useQueryClient();
  const profile = useQuery({
    queryKey: ["tutor", "profile"],
    queryFn: () => apiClient.getMyTutorProfile(),
    retry: false
  });
  const documents = useQuery({
    queryKey: ["tutor", "profile", profile.data?.id, "documents"],
    queryFn: () => apiClient.listTutorProfileDocuments(profile.data!.id),
    enabled: Boolean(profile.data?.id)
  });
  const saveProfile = useMutation({
    mutationFn: (input: TutorProfileFormInput) => apiClient.upsertMyTutorProfile(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tutor", "profile"] });
    }
  });
  const upload = useMutation({
    mutationFn: (file: File) => apiClient.uploadTutorProfileDocument(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tutor", "profile"] });
      await queryClient.invalidateQueries({
        queryKey: ["tutor", "profile", profile.data?.id, "documents"]
      });
    }
  });

  const canCreateProfile = profile.error && "status" in profile.error
    ? profile.error.status === 404
    : false;

  return (
    <AuthGate allowedRoles={["TUTOR"]}>
      <AppShell>
        <h1 className="text-xl font-semibold text-ink">Tutor profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Keep your public tutor profile and supporting documents up to date.
        </p>

        <div className="mt-5">
          {canCreateProfile ? (
            <div className="grid gap-5">
              <EmptyState
                title="Create your profile"
                detail="Parents can view your profile after it is saved."
              />
              <TutorProfileForm
                isSubmitting={saveProfile.isPending}
                onSubmit={(input) => saveProfile.mutate(input)}
              />
            </div>
          ) : (
            <ApiResult error={profile.error} isLoading={profile.isLoading}>
              <TutorProfileForm
                profile={profile.data}
                isSubmitting={saveProfile.isPending}
                onSubmit={(input) => saveProfile.mutate(input)}
              />
            </ApiResult>
          )}
        </div>

        {saveProfile.error ? (
          <div className="mt-5">
            <ErrorState title="Could not save profile" detail={saveProfile.error.message} />
          </div>
        ) : null}

        {profile.data ? (
          <div className="mt-5">
            <ApiResult error={documents.error} isLoading={documents.isLoading}>
              <DocumentList
                documents={documents.data ?? []}
                isUploading={upload.isPending}
                onUpload={(file) => upload.mutate(file)}
                queryKey={["tutor", "profile", profile.data.id, "documents"]}
                uploadError={upload.error}
              />
            </ApiResult>
          </div>
        ) : null}
      </AppShell>
    </AuthGate>
  );
}
