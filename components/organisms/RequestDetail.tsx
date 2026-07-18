"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import UrgencyBadge from "@/components/ui/UrgencyBadge";
import type { BloodRequest, RequestResponse } from "@/types/donor";

export default function RequestDetail({
  request,
  responses,
}: {
  request: BloodRequest;
  responses: RequestResponse[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(request.status);

  async function moderate(action: "spam" | "cancelled" | "open") {
    setBusy(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      setStatus(action);
      toast.success(`Request marked as ${action}`);
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">
              {request.bloodTypeNeeded} needed — {request.units} unit(s)
            </h2>
            <p className="text-sm text-brand-text-secondary">{request.hospitalName}</p>
          </div>
          <div className="flex gap-2">
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={status} />
          </div>
        </div>
        <div className="text-sm space-y-1">
          <p><span className="text-brand-text-secondary">Requester:</span> {request.requesterName} ({request.requesterPhone})</p>
          <p><span className="text-brand-text-secondary">Posted:</span> {new Date(request.createdAt).toLocaleString()}</p>
          {request.notes && <p><span className="text-brand-text-secondary">Notes:</span> {request.notes}</p>}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Responses ({responses.length})</h3>
        {responses.length === 0 ? (
          <p className="text-sm text-brand-text-secondary">No donors have responded yet.</p>
        ) : (
          <div className="space-y-2">
            {responses.map((r, i) => (
              <div key={i} className="flex justify-between items-center border-b border-brand-border last:border-0 py-2 text-sm">
                <div>
                  <p className="font-medium">{r.available ? r.donorName : "Anonymous Donor"}</p>
                  <p className="text-brand-text-secondary">{r.available ? r.donorPhone : "—"}</p>
                </div>
                <span className={r.available ? "text-brand-success font-medium" : "text-brand-text-secondary"}>
                  {r.available ? "Available" : "Unavailable"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        {status !== "spam" && (
          <button
            disabled={busy}
            onClick={() => moderate("spam")}
            className="bg-red-50 text-red-700 border border-red-200 font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          >
            Flag as Spam
          </button>
        )}
        {status !== "cancelled" && (
          <button
            disabled={busy}
            onClick={() => moderate("cancelled")}
            className="bg-slate-100 text-slate-600 border border-slate-200 font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          >
            Remove
          </button>
        )}
        {status !== "open" && (
          <button
            disabled={busy}
            onClick={() => moderate("open")}
            className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          >
            Reinstate
          </button>
        )}
      </div>
    </div>
  );
}
