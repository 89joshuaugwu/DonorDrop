import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminSession } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const admin = await verifyAdminSession(sessionCookie);

  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const db = adminDb();
    await db.collection("donors").doc(params.id).update({ verified: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("verify donor error", err);
    return NextResponse.json({ error: "Failed to verify donor" }, { status: 500 });
  }
}
