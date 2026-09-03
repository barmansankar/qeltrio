"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getClientAuth, isFirebaseClientConfigured } from "@/firebase/clientApp";
import { fetchUserProfile, safeSignOut } from "@/lib/auth/client";
import type { UserProfile } from "@/types/auth";

async function syncSessionToServer(idToken: string) {
  try {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    // Session sync failures are non-fatal; user can sign in again.
  }
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const nextProfile = await fetchUserProfile(user.uid);
    setProfile(nextProfile);
  }, [user]);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setLoading(false);
      return;
    }

    const auth = getClientAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await syncSessionToServer(idToken);
        const nextProfile = await fetchUserProfile(firebaseUser.uid);
        setProfile(nextProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    await safeSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: profile?.role === "admin",
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
