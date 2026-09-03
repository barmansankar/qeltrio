import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { mapUserDoc } from "@/lib/auth/user-profile";
import type { UserProfile } from "@/types/auth";
import type { UserRole } from "@/types";

const USERS_COLLECTION = "users";

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();

  if (!doc.exists) return null;

  return mapUserDoc(doc.id, doc.data()!);
}

export async function createUserProfile(input: {
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role?: UserRole;
}): Promise<UserProfile> {
  const db = getAdminFirestore();
  const now = Timestamp.now();
  const profile = {
    name: input.name,
    email: input.email,
    photoURL: input.photoURL ?? null,
    role: input.role ?? "user",
    createdAt: now,
    lastLoginAt: now,
  };

  await db.collection(USERS_COLLECTION).doc(input.userId).set(profile);

  return mapUserDoc(input.userId, profile);
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(USERS_COLLECTION).doc(userId).update({
    lastLoginAt: Timestamp.now(),
  });
}

export async function ensureUserProfile(input: {
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
}): Promise<UserProfile> {
  const existing = await getUserProfile(input.userId);
  if (existing) {
    await updateUserLastLogin(input.userId);
    return { ...existing, lastLoginAt: new Date().toISOString() };
  }

  return createUserProfile(input);
}
