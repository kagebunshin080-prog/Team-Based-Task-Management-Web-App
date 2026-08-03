import Link from "next/link";
import { Compass, ArrowUpRight } from "lucide-react";
import { members, tasks, statusMeta, priorityMeta } from "@/lib/data";
import { Avatar, TaskId } from "@/components/ui";

export default function Home() {
  const sample = tasks.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 md:px-10 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Compass size={20} className="text-[var(--color-accent)]" strokeWidth={2.25} />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Waypoint
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/login" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Log in
          </Link>
          <Link
            href="/register"
            className="px-3.5 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-6 md:px-10 pt-16 pb-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono-data text-[12px] uppercase tracking-widest text-[var(--color-amber)] mb-4">
              Status: all systems on track
            </p>
            <h1 className="font-display text-[44px] md:text-[56px] leading-[1.05] font-semibold tracking-tight">
              A calm control room
              <br />
              for your team&apos;s work.
            </h1>
            <p className="mt-6 text-[17px] text-[var(--color-text-muted)] max-w-md leading-relaxed">
              Waypoint gives every task a clear owner, a visible status, and a
              trail of history — so nothing drifts and nobody has to ask
              &quot;where are we on this?&quot;
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Start free
                <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                View a live dashboard →
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <span className="font-mono-data text-[11px] text-[var(--color-text-faint)] uppercase tracking-wide">
                Board UI — active tasks
              </span>
              <span className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-red)]/60" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-amber)]/60" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-green)]/60" />
              </span>
            </div>
            <ul className="divide-y divide-[var(--color-border)]">
              {sample.map((t) => (
                <li key={t.id} className="px-4 py-3.5 flex items-center gap-3">
                  <span
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: priorityMeta[t.priority].color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <TaskId id={t.id} />
                      <span
                        className="text-[10px] font-mono-data uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{
                          color: statusMeta[t.status].color,
                          backgroundColor: "var(--color-surface-raised)",
                        }}
                      >
                        {statusMeta[t.status].label}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5 truncate">{t.title}</p>
                  </div>
                  <Avatar member={t.assignee} size={26} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 md:px-10 pb-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "One board, every status",
                body: "Todo, in progress, review, done — drag tasks across lanes and watch the count update in real time.",
              },
              {
                title: "Ownership is never ambiguous",
                body: "Every task has one assignee, one due date, and a visible history of who touched it and when.",
              },
              {
                title: "Reports without the spreadsheet",
                body: "Burn-down charts, late-task counts, and per-person productivity — generated, not assembled by hand.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <h3 className="text-[15px] font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 pb-24 max-w-6xl mx-auto">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Bring your team in today
              </h2>
              <p className="text-[var(--color-text-muted)] mt-1 text-sm">
                Free for teams up to 10. No credit card required.
              </p>
            </div>
            <div className="flex items-center -space-x-2">
              {members.map((m) => (
                <Avatar key={m.id} member={m} size={32} />
              ))}
              <Link
                href="/register"
                className="ml-4 px-5 py-2.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Create your workspace
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 md:px-10 py-6 border-t border-[var(--color-border)] text-[12px] text-[var(--color-text-faint)] font-mono-data">
        Waypoint — a task management app
      </footer>
    </div>
  );
}
