import { AppShell } from "@/components/AppShell";
import { Board } from "@/components/Board";
import { tasks } from "@/lib/data";

export default function BoardPage() {
  return (
    <AppShell>
      <div className="px-8 pt-7">
        <h1 className="font-display text-2xl font-semibold">Board UI</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Drag a card between lanes to change its status.
        </p>
      </div>
      <Board initialTasks={tasks} />
    </AppShell>
  );
}
