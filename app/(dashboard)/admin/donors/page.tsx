import DashboardShell from "@/components/shells/DashboardShell";
import DonorsTable from "@/components/organisms/DonorsTable";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
import type { Donor } from "@/types/donor";

async function getDonors(): Promise<Donor[]> {
  const db = adminDb();
  const snap = await db.collection("donors").orderBy("createdAt", "desc").limit(200).get();
  return snap.docs.map((doc) => doc.data() as Donor);
}

export default async function DonorsPage() {
  const donors = await getDonors();

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold text-brand-text mb-1">Donors</h1>
      <p className="text-sm text-brand-text-secondary mb-6">
        {donors.length} registered donor{donors.length === 1 ? "" : "s"}
      </p>
      <DonorsTable donors={donors} />
    </DashboardShell>
  );
}
