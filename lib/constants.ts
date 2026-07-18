// Deliberately has ZERO imports. middleware.ts runs on Vercel's Edge
// Runtime, which cannot execute firebase-admin (it needs Node-only
// APIs like node:process, node:stream, and eval — none of which Edge
// supports). If this constant lived in lib/auth.ts instead (which DOES
// import firebase-admin), middleware.ts importing it would drag the
// whole firebase-admin SDK into the Edge bundle and fail the build.
// Keep this file this way — do not add imports to it.
export const ADMIN_SESSION_COOKIE_NAME = "donordrop_admin_session";
