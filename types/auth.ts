import type { UserRole } from "@/types";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  profile: UserProfile;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}
