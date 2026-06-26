"use client";

import { ApiError } from "@/lib/types";
import { ErrorState } from "../states/error-state";
import { ForbiddenState } from "../states/forbidden-state";
import { LoadingState } from "../states/loading-state";
import { SessionExpiredState } from "../states/session-expired-state";

export function ApiResult({
  isLoading,
  error,
  children
}: {
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    const status = (error as ApiError).status;

    if (status === 401) {
      return <SessionExpiredState />;
    }

    if (status === 403) {
      return <ForbiddenState />;
    }

    return <ErrorState detail={error.message} />;
  }

  return children;
}
