import type { UserProfile } from "@/types/auth";

export function toIsoString(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return new Date().toISOString();
}

export function mapUserDoc(
  id: string,
  data: Record<string, unknown>
): UserProfile {
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    email: typeof data.email === "string" ? data.email : "",
    photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
    role: data.role === "admin" ? "admin" : "user",
    createdAt: toIsoString(data.createdAt),
    lastLoginAt: toIsoString(data.lastLoginAt),
  };
}
