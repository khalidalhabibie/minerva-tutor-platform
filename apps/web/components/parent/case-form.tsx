"use client";

import { useForm } from "react-hook-form";
import { CaseFormInput } from "@/lib/api-client";
import { TuitionCase } from "@/lib/types";

type CaseFormValues = {
  title: string;
  subject: string;
  level: string;
  location: string;
  budgetPerHour: string;
};

export function CaseForm({
  caseRecord,
  isSubmitting,
  submitLabel,
  onSubmit
}: {
  caseRecord?: TuitionCase;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (input: CaseFormInput) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CaseFormValues>({
    defaultValues: {
      title: caseRecord?.title ?? "",
      subject: caseRecord?.subject ?? "",
      level: caseRecord?.level ?? "",
      location: caseRecord?.location ?? "",
      budgetPerHour: caseRecord ? String(caseRecord.budgetPerHour) : ""
    }
  });

  return (
    <form
      className="grid gap-4 rounded-md border border-line bg-white p-5"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          title: values.title,
          subject: values.subject,
          level: values.level,
          location: values.location,
          budgetPerHour: Number(values.budgetPerHour)
        })
      )}
    >
      <Field label="Title" error={errors.title?.message}>
        <input
          className="field"
          {...register("title", { required: "Title is required" })}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Subject" error={errors.subject?.message}>
          <input
            className="field"
            {...register("subject", { required: "Subject is required" })}
          />
        </Field>
        <Field label="Level" error={errors.level?.message}>
          <input
            className="field"
            {...register("level", { required: "Level is required" })}
          />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Location" error={errors.location?.message}>
          <input
            className="field"
            {...register("location", { required: "Location is required" })}
          />
        </Field>
        <Field label="Budget per hour" error={errors.budgetPerHour?.message}>
          <input
            className="field"
            inputMode="numeric"
            {...register("budgetPerHour", {
              required: "Budget is required",
              validate: (value) =>
                Number(value) >= 0 || "Budget must be zero or more"
            })}
          />
        </Field>
      </div>
      <button
        className="w-fit rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </label>
  );
}
