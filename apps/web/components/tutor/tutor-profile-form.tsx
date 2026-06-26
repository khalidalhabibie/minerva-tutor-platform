"use client";

import { useForm } from "react-hook-form";
import { TutorProfileFormInput } from "@/lib/api-client";
import { TutorProfile } from "@/lib/types";

export function TutorProfileForm({
  profile,
  isSubmitting,
  onSubmit
}: {
  profile?: TutorProfile;
  isSubmitting: boolean;
  onSubmit: (input: TutorProfileFormInput) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TutorProfileFormInput>({
    values: {
      displayName: profile?.displayName ?? "",
      qualifications: profile?.qualifications ?? "",
      experiences: profile?.experiences ?? ""
    }
  });

  return (
    <form
      className="grid gap-4 rounded-md border border-line bg-white p-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">Display name</span>
        <input
          className="field"
          {...register("displayName", { required: "Display name is required" })}
        />
        {errors.displayName ? (
          <span className="text-xs text-red-600">{errors.displayName.message}</span>
        ) : null}
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">Qualifications</span>
        <textarea
          className="field min-h-28"
          {...register("qualifications", {
            required: "Qualifications are required"
          })}
        />
        {errors.qualifications ? (
          <span className="text-xs text-red-600">
            {errors.qualifications.message}
          </span>
        ) : null}
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">Experiences</span>
        <textarea
          className="field min-h-28"
          {...register("experiences", { required: "Experiences are required" })}
        />
        {errors.experiences ? (
          <span className="text-xs text-red-600">{errors.experiences.message}</span>
        ) : null}
      </label>

      <div>
        <button
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
