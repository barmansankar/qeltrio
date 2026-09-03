import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthLoading } from "@/components/auth/auth-loading";

export const metadata = {
  title: "Sign Up",
  description: "Create your Qeltrio account.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthLoading className="min-h-screen" />}>
      <SignUpForm />
    </Suspense>
  );
}
