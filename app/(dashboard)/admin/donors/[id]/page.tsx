import { notFound } from "next/navigation";
import DashboardShell from "@/components/shells/DashboardShell";
import DonorDetail from "@/components/organisms/DonorDetail";
import { adminDb } from "@/lib/firebase-admin";
import type { Donor } from "@/types/donor";

async function getDonor(id: string): Promise<Donor | null> {
  const db = adminDb();
  const snap = await db.collection("donors").doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as Donor;
}

export default async function DonorDetailPage({ params }: { params: { id: string } }) {
  const donor = await getDonor(params.id);
  if (!donor) notFound();

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold text-brand-text mb-6">Donor Detail</h1>
      <DonorDetail donor={donor} />
    </DashboardShell>
  );
}
