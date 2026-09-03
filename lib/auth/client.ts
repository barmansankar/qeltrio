import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getClientAuth, getClientFirestore } from "@/firebase/clientApp";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import type { ForgotPasswordInput, SignInInput, SignUpInput, UserProfile } from "@/types/auth";
import { mapUserDoc } from "@/lib/auth/user-profile";

async function syncSession(idToken: string, body?: Record<string, unknown>) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, ...body }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to establish session.");
  }
}

export async function signUp(input: SignUpInput): Promise<User> {
  const auth = getClientAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.password
  );

  await updateProfile(credential.user, { displayName: input.name });

  const idToken = await credential.user.getIdToken(true);
  await syncSession(idToken, {
    name: input.name,
    email: input.email,
    isNewUser: true,
  });

  return credential.user;
}

export async function signIn(input: SignInInput): Promise<User> {
  const auth = getClientAuth();
  const credential = await signInWithEmailAndPassword(
    auth,
    input.email,
    input.password
  );

  const idToken = await credential.user.getIdToken(true);
  await syncSession(idToken);

  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
  await signOut(getClientAuth());
}

export async function sendPasswordReset(input: ForgotPasswordInput): Promise<void> {
  const auth = getClientAuth();
  await sendPasswordResetEmail(auth, input.email);
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, "users", userId));

  if (!snapshot.exists()) return null;

  return mapUserDoc(snapshot.id, snapshot.data());
}

export async function safeSignUp(input: SignUpInput) {
  try {
    const user = await signUp(input);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error) };
  }
}

export async function safeSignIn(input: SignInInput) {
  try {
    const user = await signIn(input);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error) };
  }
}

export async function safeSendPasswordReset(input: ForgotPasswordInput) {
  try {
    await sendPasswordReset(input);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}

export async function safeSignOut() {
  try {
    await signOutUser();
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}
