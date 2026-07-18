"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Donor } from "@/types/donor";

export default function DonorsTable({ donors }: { donors: Donor[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");

  const filtered = donors.filter((d) => {
    if (filter === "all") return true;
    if (filter === "verified") return d.verified;
    return !d.verified;
  });

  const columns: Column<Donor>[] = [
    { header: "Name", render: (d) => <span className="font-medium">{d.name}</span> },
    { header: "Blood Type", render: (d) => <span className="font-extrabold">{d.bloodType}</span> },
    { header: "Total Donations", render: (d) => d.totalDonations ?? 0 },
    { header: "Visible", render: (d) => (d.isVisible ? "Yes" : "No") },
    {
      header: "Status",
      render: (d) => <StatusBadge status={d.verified ? "verified" : "unverified"} />,
    },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["all", "verified", "unverified"] as const).map((f) => (
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
        onRowClick={(d) => router.push(`/admin/donors/${d.uid}`)}
        emptyMessage="No donors match this filter."
      />
    </div>
  );
}
