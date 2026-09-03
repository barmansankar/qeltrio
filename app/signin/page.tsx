import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthLoading } from "@/components/auth/auth-loading";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your Qeltrio account.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthLoading className="min-h-screen" />}>
      <SignInForm />
    </Suspense>
  );
}
