import { UserRole } from "./types";

export function dashboardPathForRole(role: UserRole): string {
  return role === "PARENT" ? "/parent/cases" : "/tutor/cases";
}
