"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "./api-client";
import { dashboardPathForRole } from "./routes";
import { tokenStorage } from "./token-storage";

export const currentUserQueryKey = ["auth", "me"];

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: apiClient.me,
    retry: false,
    enabled: typeof window !== "undefined" && Boolean(tokenStorage.get())
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiClient.login(input.email, input.password),
    onSuccess: async (response) => {
      tokenStorage.set(response.accessToken);
      queryClient.setQueryData(currentUserQueryKey, response.user);
      router.replace(dashboardPathForRole(response.user.role));
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: apiClient.logout,
    onSettled: async () => {
      tokenStorage.clear();
      queryClient.clear();
      router.replace("/login");
    }
  });
}
