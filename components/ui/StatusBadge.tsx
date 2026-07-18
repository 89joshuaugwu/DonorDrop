type Status = "open" | "fulfilled" | "spam" | "cancelled" | "verified" | "unverified";

const STYLES: Record<Status, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  fulfilled: "bg-green-50 text-green-700 border-green-200",
  spam: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  verified: "bg-green-50 text-green-700 border-green-200",
  unverified: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
