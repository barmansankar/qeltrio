import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    clientCredentials.apiKey &&
      clientCredentials.authDomain &&
      clientCredentials.projectId &&
      clientCredentials.appId
  );
}

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local (see firebase/clientApp.ts)."
    );
  }

  return getApps().length > 0 ? getApps()[0]! : initializeApp(clientCredentials);
}

let auth: Auth | undefined;
let db: Firestore | undefined;

export function getClientAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getClientFirestore(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export { getFirebaseApp };

const firebase = {
  app: getFirebaseApp,
  auth: getClientAuth,
  firestore: getClientFirestore,
  credentials: clientCredentials,
};

export default firebase;
