import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your Qeltrio account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
