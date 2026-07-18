import { notFound } from "next/navigation";
import DashboardShell from "@/components/shells/DashboardShell";
import RequestDetail from "@/components/organisms/RequestDetail";
import { adminDb } from "@/lib/firebase-admin";
import type { BloodRequest, RequestResponse } from "@/types/donor";

async function getRequestWithResponses(id: string) {
  const db = adminDb();
  const requestSnap = await db.collection("requests").doc(id).get();
  if (!requestSnap.exists) return null;

  const responsesSnap = await db
    .collection("requests")
    .doc(id)
    .collection("responses")
    .orderBy("respondedAt", "desc")
    .get();

  return {
    request: { id: requestSnap.id, ...requestSnap.data() } as BloodRequest,
    responses: responsesSnap.docs.map((d) => d.data() as RequestResponse),
  };
}

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const data = await getRequestWithResponses(params.id);
  if (!data) notFound();

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold text-brand-text mb-6">Request Detail</h1>
      <RequestDetail request={data.request} responses={data.responses} />
    </DashboardShell>
  );
}
