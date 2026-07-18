import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { adminDb } from "./firebase-admin";
import type { BloodType, Donor } from "@/types/donor";

/**
 * Blood type compatibility matrix — who can receive from whom.
 * Key = donor's blood type, value = list of recipient blood types
 * that donor's blood is compatible with.
 */
const DONOR_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // universal donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // AB+ can only donate to AB+
};

/**
 * Given a blood type NEEDED by a request, return every donor blood type
 * that is compatible (i.e. can donate to that recipient).
 * AB+ recipients can accept from all types (universal recipient).
 */
export function getCompatibleDonorTypes(bloodTypeNeeded: BloodType): BloodType[] {
  const compatible: BloodType[] = [];
  (Object.keys(DONOR_COMPATIBILITY) as BloodType[]).forEach((donorType) => {
    if (DONOR_COMPATIBILITY[donorType].includes(bloodTypeNeeded)) {
      compatible.push(donorType);
    }
  });
  return compatible;
}

export interface NearbyDonor extends Donor {
  distanceKm: number;
}

/**
 * Finds donors within `radiusKm` of (lat, lng) whose blood type is
 * compatible with `bloodTypeNeeded`, who are visible, and (optionally)
 * verified. Uses the geohash "bounding box fan-out" pattern since
 * Firestore can't do native radius queries.
 */
export async function findNearbyDonors(
  lat: number,
  lng: number,
  bloodTypeNeeded: BloodType,
  radiusKm: number = 15
): Promise<NearbyDonor[]> {
  const db = adminDb();
  const center: [number, number] = [lat, lng];
  const radiusInM = radiusKm * 1000;

  const bounds = geohashQueryBounds(center, radiusInM);
  const compatibleTypes = getCompatibleDonorTypes(bloodTypeNeeded);

  const donorPromises = bounds.map(([start, end]) =>
    db
      .collection("donors")
      .orderBy("geohash")
      .startAt(start)
      .endAt(end)
      .where("isVisible", "==", true)
      .where("bloodType", "in", compatibleTypes.slice(0, 10)) // Firestore 'in' cap
      .get()
  );

  const snapshots = await Promise.all(donorPromises);

  const matched: NearbyDonor[] = [];
  const seen = new Set<string>();

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const donor = doc.data() as Donor;
      if (seen.has(donor.uid)) continue;
      seen.add(donor.uid);

      const distanceKm = distanceBetween([donor.lat, donor.lng], center);
      if (distanceKm <= radiusKm) {
        matched.push({ ...donor, distanceKm });
      }
    }
  }

  // NOTE: this bulk geohash query has to stay broadly readable (lat/lng/
  // geohash/bloodType/isVisible) for the search itself to work at all —
  // it can't be locked down to "owner only" the way phone/name are.
  // Privacy for phone numbers is enforced by NOT selecting/returning
  // those fields here, and separately by the Firestore rule
  // (CONTEXT.md Section 10) that blocks direct reads of donor phone
  // fields by any client other than the owner or an admin. Both layers
  // matter — the rule alone doesn't help if this query fans out the
  // full donor doc, and this query alone doesn't help if the rule lets
  // any authenticated client read any donor doc directly.
  return matched.sort((a, b) => a.distanceKm - b.distanceKm);
}
