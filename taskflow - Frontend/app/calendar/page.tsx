import { AppShell } from "@/components/AppShell";

export default function CalendarPage() {
  return (
    <AppShell>
      <div className="px-8 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-xl font-semibold">Calendar is on the roadmap</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm">
          This part of Waypoint hasn&apos;t been built yet — it ships after the MVP core (auth, dashboard, board) is in place.
        </p>
      </div>
    </AppShell>
  );
}
