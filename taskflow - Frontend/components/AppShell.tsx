"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  KanbanSquare,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  Compass,
} from "lucide-react";
import { Avatar } from "./ui";
import { currentUser } from "@/lib/data";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/board", label: "Board", icon: KanbanSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-[var(--color-border)]">
          <Compass size={20} className="text-[var(--color-accent)]" strokeWidth={2.25} />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Waypoint
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.03]"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
                {active && (
                  <span
                    className="ml-auto w-1 h-1 rounded-full"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--color-border)]">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.03]"
          >
            <Settings size={17} strokeWidth={2} />
            Settings
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <Avatar member={currentUser} size={26} />
            <div className="min-w-0">
              <p className="text-sm truncate">{currentUser.name}</p>
              <p className="text-[11px] text-[var(--color-text-faint)] font-mono-data">
                ABC Pvt Ltd
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-[var(--color-border)] flex items-center justify-between px-6">
          <div />
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.03]"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-red)]" />
          </button>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
