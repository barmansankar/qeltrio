import { Suspense } from "react";
import { AccountOverview } from "@/components/account/account-overview";
import { AuthLoading } from "@/components/auth/auth-loading";

export const metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <Suspense fallback={<AuthLoading className="py-16" />}>
      <AccountOverview />
    </Suspense>
  );
}
