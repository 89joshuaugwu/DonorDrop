import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }
    await createAdminSession(idToken);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("admin login error", err);
    return NextResponse.json(
      { error: err.message || "Login failed" },
      { status: 401 }
    );
  }
}
