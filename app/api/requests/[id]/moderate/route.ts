import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminSession, ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const admin = await verifyAdminSession(sessionCookie);

  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const { action } = await request.json(); // "spam" | "cancelled" | "open"
    if (!["spam", "cancelled", "open"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const db = adminDb();
    await db.collection("requests").doc(params.id).update({ status: action });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("moderate request error", err);
    return NextResponse.json({ error: "Failed to moderate request" }, { status: 500 });
  }
}
