import { AppShell } from "@/components/AppShell";
import { Avatar, PriorityFlag, TaskId } from "@/components/ui";
import {
  tasks,
  statusMeta,
  formatDueDate,
  currentUser,
} from "@/lib/data";
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";

export default function DashboardPage() {
  const myTasks = tasks.filter((t) => t.assignee.id === currentUser.id && t.status !== "done");
  const upcoming = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const stats = [
    {
      label: "Todo",
      value: tasks.filter((t) => t.status === "todo").length,
      icon: ListTodo,
      color: "var(--color-text-muted)",
    },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "in_progress").length,
      icon: Clock,
      color: "var(--color-accent)",
    },
    {
      label: "Overdue",
      value: 1,
      icon: AlertTriangle,
      color: "var(--color-red)",
    },
    {
      label: "Done this week",
      value: tasks.filter((t) => t.status === "done").length,
      icon: CheckCircle2,
      color: "var(--color-green)",
    },
  ];

  const activity = [
    { who: "John", what: "moved TSK-049 to In Progress", when: "12m ago" },
    { who: "Rahul", what: "commented on TSK-044", when: "38m ago" },
    { who: "Sam", what: "uploaded a file to TSK-042", when: "1h ago" },
    { who: "Priya", what: "closed TSK-048", when: "yesterday" },
  ];

  return (
    <AppShell>
      <div className="px-8 py-7 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Good to see you, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Here&apos;s where things stand across ABC Pvt Ltd.
            </p>
          </div>
          <span className="font-mono-data text-xs text-[var(--color-text-faint)]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-mono-data">
                  {s.label}
                </span>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
              <p className="font-display text-2xl font-semibold mt-2" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-sm font-medium">Upcoming deadlines</h2>
              <span className="text-xs text-[var(--color-text-faint)] font-mono-data">
                {upcoming.length} tasks
              </span>
            </div>
            <ul className="divide-y divide-[var(--color-border)]">
              {upcoming.map((t) => (
                <li key={t.id} className="px-5 py-3.5 flex items-center gap-4">
                  <TaskId id={t.id} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{t.title}</p>
                    <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{t.project}</p>
                  </div>
                  <PriorityFlag priority={t.priority} />
                  <span
                    className="text-xs font-mono-data w-14 text-right"
                    style={{ color: statusMeta[t.status].color }}
                  >
                    {formatDueDate(t.dueDate)}
                  </span>
                  <Avatar member={t.assignee} size={26} />
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="px-5 py-3.5 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-medium">Your tasks</h2>
              </div>
              <ul className="divide-y divide-[var(--color-border)]">
                {myTasks.map((t) => (
                  <li key={t.id} className="px-5 py-3 flex items-center gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: statusMeta[t.status].color }}
                    />
                    <p className="text-sm truncate flex-1">{t.title}</p>
                  </li>
                ))}
                {myTasks.length === 0 && (
                  <li className="px-5 py-4 text-sm text-[var(--color-text-faint)]">
                    Nothing assigned right now.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="px-5 py-3.5 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-medium">Recent activity</h2>
              </div>
              <ul className="divide-y divide-[var(--color-border)]">
                {activity.map((a, i) => (
                  <li key={i} className="px-5 py-3 text-sm">
                    <span className="text-[var(--color-text)]">{a.who}</span>{" "}
                    <span className="text-[var(--color-text-muted)]">{a.what}</span>
                    <p className="text-[11px] text-[var(--color-text-faint)] font-mono-data mt-0.5">
                      {a.when}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
