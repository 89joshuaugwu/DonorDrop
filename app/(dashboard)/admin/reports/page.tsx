import DashboardShell from "@/components/shells/DashboardShell";
import ReportsCharts, { ReportsData } from "@/components/organisms/ReportsCharts";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
import type { BloodRequest, BloodType, Donor } from "@/types/donor";

const ALL_BLOOD_TYPES: BloodType[] = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

async function getReportsData(): Promise<ReportsData> {
  const db = adminDb();

  const [donorsSnap, requestsSnap] = await Promise.all([
    db.collection("donors").get(),
    db.collection("requests").get(),
  ]);

  const donors = donorsSnap.docs.map((d) => d.data() as Donor);
  const requests = requestsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as BloodRequest);

  const bloodTypeDistribution = ALL_BLOOD_TYPES.map((bt) => ({
    bloodType: bt,
    count: donors.filter((d) => d.bloodType === bt).length,
  }));

  const fulfilled = requests.filter((r) => r.status === "fulfilled");
  const fulfillmentRate = requests.length > 0 ? (fulfilled.length / requests.length) * 100 : 0;

  const responseTimes = fulfilled
    .filter((r) => r.fulfilledAt)
    .map((r) => (new Date(r.fulfilledAt as string).getTime() - new Date(r.createdAt).getTime()) / 60000);

  const avgResponseTimeMinutes =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

  return { bloodTypeDistribution, fulfillmentRate, avgResponseTimeMinutes };
}

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold text-brand-text mb-1">Reports</h1>
      <p className="text-sm text-brand-text-secondary mb-6">
        Blood type distribution, fulfillment rate, and response time analytics
      </p>
      <ReportsCharts data={data} />
    </DashboardShell>
  );
}
