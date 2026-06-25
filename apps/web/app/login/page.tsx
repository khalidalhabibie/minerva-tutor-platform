"use client";

import { useForm } from "react-hook-form";
import { ErrorState } from "@/components/states/error-state";
import { useLogin } from "@/lib/auth-hooks";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    defaultValues: {
      email: "parent@example.com",
      password: "Password123!"
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-panel px-4">
      <section className="w-full max-w-sm rounded-md border border-line bg-white p-6">
        <h1 className="text-xl font-semibold text-ink">Sign in</h1>
        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit((values) => login.mutate(values))}
        >
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-700">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <button
            className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={login.isPending}
            type="submit"
          >
            {login.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {login.error ? (
          <div className="mt-4">
            <ErrorState title="Sign in failed" detail={login.error.message} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
