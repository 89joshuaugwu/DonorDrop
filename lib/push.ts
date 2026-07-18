import { adminDb } from "./firebase-admin";
import { findNearbyDonors, NearbyDonor } from "./geohash";
import type { BloodRequest } from "@/types/donor";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data: Record<string, unknown>;
}

/**
 * Sends push notifications (via Expo's push service — free, no Firebase
 * Blaze plan required) to every donor matched by findNearbyDonors(), and
 * writes a corresponding in-app notification doc for each matched donor
 * so the Notifications screen has something to show even if the push
 * itself is missed (app closed, notifications denied, etc).
 */
export async function notifyMatchingDonors(request: BloodRequest): Promise<{
  matchedCount: number;
  pushedCount: number;
}> {
  const db = adminDb();

  const matches: NearbyDonor[] = await findNearbyDonors(
    request.lat,
    request.lng,
    request.bloodTypeNeeded,
    15
  );

  if (matches.length === 0) {
    return { matchedCount: 0, pushedCount: 0 };
  }

  // Write in-app notification docs first — this must succeed even if
  // the Expo push call below fails or partially fails.
  const batch = db.batch();
  const now = new Date().toISOString();

  for (const donor of matches) {
    const notifRef = db
      .collection("notifications")
      .doc(donor.uid)
      .collection("items")
      .doc();

    batch.set(notifRef, {
      requestId: request.id,
      title: `${request.urgency} — ${request.bloodTypeNeeded} needed nearby`,
      body: `${request.hospitalName} needs ${request.units} unit(s) of ${request.bloodTypeNeeded} blood. ~${donor.distanceKm.toFixed(1)}km away.`,
      read: false,
      createdAt: now,
    });
  }
  await batch.commit();

  // Fan out Expo push messages, batching in groups of 100 per Expo's
  // documented recommendation.
  const messages: ExpoPushMessage[] = matches
    .filter((d) => !!d.pushToken)
    .map((donor) => ({
      to: donor.pushToken as string,
      sound: "default",
      title: `${request.urgency} — ${request.bloodTypeNeeded} needed nearby`,
      body: `${request.hospitalName} needs ${request.units} unit(s) of ${request.bloodTypeNeeded} blood. ~${donor.distanceKm.toFixed(1)}km away.`,
      data: { requestId: request.id },
    }));

  let pushedCount = 0;
  const chunkSize = 100;
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    try {
      const res = await fetch(EXPO_PUSH_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });
      if (res.ok) {
        pushedCount += chunk.length;
      } else {
        console.error("Expo push batch failed", await res.text());
      }
    } catch (err) {
      console.error("Expo push batch error", err);
    }
  }

  return { matchedCount: matches.length, pushedCount };
}
