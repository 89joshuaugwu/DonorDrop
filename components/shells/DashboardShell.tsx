"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, BarChart3, LogOut, Droplet } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/donors", label: "Donors", icon: Users },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <aside className="w-60 bg-white border-r border-brand-border flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-brand-border">
          <Droplet className="text-brand-red" size={22} fill="#DC2626" />
          <span className="font-extrabold text-lg text-brand-text">DonorDrop</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-red-50 text-brand-red"
                    : "text-brand-text-secondary hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-brand-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-text-secondary hover:bg-slate-50 w-full"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
