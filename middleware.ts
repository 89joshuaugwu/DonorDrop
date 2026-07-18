import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth";

// NOTE: Edge middleware can't call firebase-admin's Node SDK directly, so
// this does a lightweight presence check (cookie exists). Full claim
// verification happens again in the actual page/route via
// verifyAdminSession() — middleware here is the fast-path redirect for
// UX, not the security boundary. The real boundary is Firestore rules +
// verifyAdminSession() in each protected page/route.
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/donors/:path*", "/admin/requests/:path*", "/admin/reports/:path*"],
};
