"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { AuthCard, AuthAlert } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeSendPasswordReset } from "@/lib/auth/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await safeSendPasswordReset({ email });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-50">
            Reset your password
          </h1>
          <p className="mt-2 text-body text-sm">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <AuthCard>
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm text-zinc-400">
                If an account exists for <strong className="text-zinc-300">{email}</strong>, you&apos;ll
                receive a password reset email shortly.
              </p>
              <Link href="/signin" className="mt-6 inline-block w-full">
                <Button variant="secondary" size="md" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <AuthAlert>{error}</AuthAlert>}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="mt-6 w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="mt-4 text-center text-body text-sm">
                Remember your password?{" "}
                <Link href="/signin" className="text-violet-400/90 transition-colors hover:text-violet-300">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
