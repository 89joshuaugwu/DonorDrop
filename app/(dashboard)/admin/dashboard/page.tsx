import DashboardShell from "@/components/shells/DashboardShell";
import Card from "@/components/ui/Card";
import { adminDb } from "@/lib/firebase-admin";
import { Users, ClipboardList, Droplet } from "lucide-react";

async function getStats() {
  const db = adminDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [donorsSnap, openRequestsSnap, donationsSnap] = await Promise.all([
    db.collection("donors").count().get(),
    db.collection("requests").where("status", "==", "open").count().get(),
    db.collection("donations").where("loggedAt", ">=", startOfMonth).count().get(),
  ]);

  return {
    activeDonors: donorsSnap.data().count,
    openRequests: openRequestsSnap.data().count,
    donationsThisMonth: donationsSnap.data().count,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold text-brand-text mb-1">Dashboard</h1>
      <p className="text-sm text-brand-text-secondary mb-6">
        Overview of DonorDrop activity
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-secondary">Active Donors</p>
              <p className="text-3xl font-extrabold tabular-nums mt-1">{stats.activeDonors}</p>
            </div>
            <Users className="text-brand-red" size={28} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-secondary">Open Requests</p>
              <p className="text-3xl font-extrabold tabular-nums mt-1">{stats.openRequests}</p>
            </div>
            <ClipboardList className="text-brand-normal" size={28} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-secondary">Donations This Month</p>
              <p className="text-3xl font-extrabold tabular-nums mt-1">{stats.donationsThisMonth}</p>
            </div>
            <Droplet className="text-brand-success" size={28} />
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
