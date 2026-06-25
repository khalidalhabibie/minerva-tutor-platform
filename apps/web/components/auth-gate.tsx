"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useCurrentUser } from "@/lib/auth-hooks";
import { tokenStorage } from "@/lib/token-storage";
import { UserRole } from "@/lib/types";
import { ErrorState } from "./states/error-state";
import { ForbiddenState } from "./states/forbidden-state";
import { LoadingState } from "./states/loading-state";
import { SessionExpiredState } from "./states/session-expired-state";

export function AuthGate({
  children,
  allowedRoles
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const hasToken = typeof window !== "undefined" && Boolean(tokenStorage.get());
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login");
    }
  }, [hasToken, router]);

  if (!hasToken) {
    return <SessionExpiredState />;
  }

  if (currentUser.isLoading) {
    return <LoadingState label="Loading session" />;
  }

  if (currentUser.error) {
    const status = "status" in currentUser.error ? currentUser.error.status : undefined;

    if (status === 401) {
      return <SessionExpiredState />;
    }

    return <ErrorState detail={currentUser.error.message} />;
  }

  if (
    allowedRoles &&
    currentUser.data &&
    !allowedRoles.includes(currentUser.data.role)
  ) {
    return <ForbiddenState />;
  }

  return children;
}
