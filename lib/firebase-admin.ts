import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// NOTE (recurring footgun across your projects): FIREBASE_ADMIN_PRIVATE_KEY
// must have literal "\n" sequences replaced with real newlines. Vercel env
// vars store the key as a single-line string with "\n" as text, not an
// actual line break, so it must be un-escaped at runtime like below.

function getServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env vars. Check FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  return { projectId, clientEmail, privateKey };
}

let app: App;

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  const serviceAccount = getServiceAccount();
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  return app;
}

export const adminDb = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());
