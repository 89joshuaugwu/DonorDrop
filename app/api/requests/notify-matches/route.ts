import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { notifyMatchingDonors } from "@/lib/push";
import type { BloodRequest } from "@/types/donor";

// Called DIRECTLY by the mobile app (a different origin from this
// dashboard) right after a requester posts a new request. Runs the full
// matching + push + in-app-notification-write flow server-side, since it
// needs firebase-admin both for the geo query at scale and to write
// notification docs on behalf of OTHER users (donors), which a mobile
// client's own Firebase Auth session could never do directly under
// normal Firestore rules.

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return withCors(NextResponse.json({ error: "requestId is required" }, { status: 400 }));
    }

    const db = adminDb();
    const requestSnap = await db.collection("requests").doc(requestId).get();

    if (!requestSnap.exists) {
      return withCors(NextResponse.json({ error: "Request not found" }, { status: 404 }));
    }

    const bloodRequest = { id: requestSnap.id, ...requestSnap.data() } as BloodRequest;

    if (bloodRequest.status !== "open") {
      return withCors(
        NextResponse.json({ error: "Request is not open, skipping notify" }, { status: 409 })
      );
    }

    const result = await notifyMatchingDonors(bloodRequest);

    return withCors(
      NextResponse.json({
        ok: true,
        requestId,
        matchedDonors: result.matchedCount,
        pushNotificationsSent: result.pushedCount,
      })
    );
  } catch (err) {
    console.error("notify-matches error", err);
    return withCors(NextResponse.json({ error: "Failed to notify matching donors" }, { status: 500 }));
  }
}
