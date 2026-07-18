import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-brand-border rounded-xl shadow-sm p-5 ${className}`}
    >
      {children}
    </div>
  );
}
