import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/firebase/config";
import { ensureUserProfile, getUserProfile } from "@/lib/auth/users";
import type { AuthUser } from "@/types/auth";

export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  return auth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });
}

export async function verifySessionCookie(
  sessionCookie: string
): Promise<{ uid: string; email: string | null } | null> {
  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const decoded = await verifySessionCookie(session);
  if (!decoded) return null;

  const profile = await getUserProfile(decoded.uid);
  if (!profile) return null;

  return {
    uid: decoded.uid,
    email: decoded.email,
    profile,
  };
}

export async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await requireAuthenticatedUser();
  if (user.profile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function establishUserSession(input: {
  idToken: string;
  name?: string;
  email?: string;
  photoURL?: string | null;
  isNewUser?: boolean;
}): Promise<AuthUser> {
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(input.idToken);

  const profile = await ensureUserProfile({
    userId: decoded.uid,
    name: input.name ?? decoded.name ?? "User",
    email: input.email ?? decoded.email ?? "",
    photoURL: input.photoURL ?? decoded.picture ?? null,
  });

  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    profile,
  };
}

export function getSessionCookieOptions(sessionCookie: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}

export function getClearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
}
