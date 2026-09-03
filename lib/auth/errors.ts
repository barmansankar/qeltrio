const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/missing-password": "Please enter your password.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled for this project.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }
  }

  return "Something went wrong. Please try again.";
}
