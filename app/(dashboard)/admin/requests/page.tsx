import DashboardShell from "@/components/shells/DashboardShell";
import RequestsTable from "@/components/organisms/RequestsTable";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
import type { BloodRequest } from "@/types/donor";

async function getRequests(): Promise<BloodRequest[]> {
  const db = adminDb();
  const snap = await db.collection("requests").orderBy("createdAt", "desc").limit(200).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as BloodRequest);
}

export default async function RequestsPage() {
  const requests = await getRequests();

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold text-brand-text mb-1">Requests</h1>
      <p className="text-sm text-brand-text-secondary mb-6">
        {requests.length} total request{requests.length === 1 ? "" : "s"}
      </p>
      <RequestsTable requests={requests} />
    </DashboardShell>
  );
}
