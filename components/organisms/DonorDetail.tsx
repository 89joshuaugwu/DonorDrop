"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Donor } from "@/types/donor";

export default function DonorDetail({ donor }: { donor: Donor }) {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(donor.verified);

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await fetch(`/api/donors/${donor.uid}/verify`, { method: "POST" });
      if (!res.ok) throw new Error("Verification failed");
      setVerified(true);
      toast.success("Donor verified");
      router.refresh();
    } catch (err) {
      toast.error("Could not verify donor");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{donor.name}</h2>
            <p className="text-sm text-brand-text-secondary">{donor.phone}</p>
          </div>
          <StatusBadge status={verified ? "verified" : "unverified"} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
          <div>
            <p className="text-brand-text-secondary">Blood Type</p>
            <p className="font-extrabold text-lg">{donor.bloodType}</p>
          </div>
          <div>
            <p className="text-brand-text-secondary">Total Donations</p>
            <p className="font-semibold">{donor.totalDonations ?? 0}</p>
          </div>
          <div>
            <p className="text-brand-text-secondary">Last Donation</p>
            <p className="font-semibold">
              {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}
            </p>
          </div>
          <div>
            <p className="text-brand-text-secondary">Visible in Search</p>
            <p className="font-semibold">{donor.isVisible ? "Yes" : "No"}</p>
          </div>
        </div>
      </Card>

      {!verified && (
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-4 py-2.5 rounded-lg text-sm disabled:opacity-60"
        >
          {verifying ? "Verifying..." : "Verify Donor"}
        </button>
      )}
    </div>
  );
}
