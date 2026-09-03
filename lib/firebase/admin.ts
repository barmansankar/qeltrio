import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Add it to .env.local (server-only)."
    );
  }

  try {
    return JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.");
  }
}

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const serviceAccount = parseServiceAccount();

  adminApp = initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });

  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
