import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

const SESSION_COOKIE = "donordrop_admin_session";
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

/**
 * Verifies a Firebase ID token (obtained client-side after email/password
 * sign-in) belongs to a user with an "admin" custom claim, then creates a
 * server-side session cookie. There is NO public admin signup — the first
 * admin account must be created manually:
 *   1. Firebase Console -> Authentication -> Add user (email/password)
 *   2. Run once, server-side: adminAuth().setCustomUserClaims(uid, { admin: true })
 * Subsequent admins can be promoted the same way, from this admin panel
 * or via a one-off script — never via public signup.
 */
export async function createAdminSession(idToken: string) {
  const decoded = await adminAuth().verifyIdToken(idToken);
  if (!decoded.admin) {
    throw new Error("This account does not have admin access.");
  }

  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRY_MS,
  });

  cookies().set(SESSION_COOKIE, sessionCookie, {
    maxAge: SESSION_EXPIRY_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function verifyAdminSession(sessionCookie: string | undefined) {
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    if (!decoded.admin) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  cookies().delete(SESSION_COOKIE);
}

export const ADMIN_SESSION_COOKIE_NAME = SESSION_COOKIE;
