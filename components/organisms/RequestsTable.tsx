"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import UrgencyBadge from "@/components/ui/UrgencyBadge";
import type { BloodRequest, RequestStatus } from "@/types/donor";

const FILTERS: (RequestStatus | "all")[] = ["all", "open", "fulfilled", "spam", "cancelled"];

export default function RequestsTable({ requests }: { requests: BloodRequest[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);

  const columns: Column<BloodRequest>[] = [
    { header: "Blood Type", render: (r) => <span className="font-extrabold">{r.bloodTypeNeeded}</span> },
    { header: "Urgency", render: (r) => <UrgencyBadge urgency={r.urgency} /> },
    { header: "Hospital", render: (r) => r.hospitalName },
    { header: "Units", render: (r) => r.units },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { header: "Posted", render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize ${
              filter === f
                ? "bg-brand-red text-white border-brand-red"
                : "bg-white text-brand-text-secondary border-brand-border hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        onRowClick={(r) => router.push(`/admin/requests/${r.id}`)}
        emptyMessage="No requests match this filter."
      />
    </div>
  );
}
