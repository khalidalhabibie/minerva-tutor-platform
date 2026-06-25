"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth-hooks";
import { dashboardPathForRole } from "@/lib/routes";
import { tokenStorage } from "@/lib/token-storage";
import { LoadingState } from "@/components/states/loading-state";

export default function HomePage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const hasToken = typeof window !== "undefined" && Boolean(tokenStorage.get());

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login");
      return;
    }

    if (currentUser.data) {
      router.replace(dashboardPathForRole(currentUser.data.role));
    }
  }, [currentUser.data, hasToken, router]);

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <LoadingState label="Opening dashboard" />
    </main>
  );
}
