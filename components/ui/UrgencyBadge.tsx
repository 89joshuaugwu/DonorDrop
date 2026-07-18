import type { RequestUrgency } from "@/types/donor";

const STYLES: Record<RequestUrgency, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  Urgent: "bg-orange-50 text-orange-700 border-orange-200",
  Normal: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function UrgencyBadge({ urgency }: { urgency: RequestUrgency }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STYLES[urgency]}`}
    >
      {urgency}
    </span>
  );
}
