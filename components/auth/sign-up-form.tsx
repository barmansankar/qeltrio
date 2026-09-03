"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { AuthCard, AuthAlert } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeSignUp } from "@/lib/auth/client";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await safeSignUp({ name, email, password });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-50">
            Create an account
          </h1>
          <p className="mt-2 text-body text-sm">
            Join Qeltrio and start building faster.
          </p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit}>
            {error && <AuthAlert>{error}</AuthAlert>}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="mt-6 w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="mt-4 text-center text-body text-sm">
              Already have an account?{" "}
              <Link href="/signin" className="text-violet-400/90 transition-colors hover:text-violet-300">
                Sign in
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
