import Link from "next/link";
import { Compass } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Compass size={22} className="text-[var(--color-accent)]" strokeWidth={2.25} />
          <span className="font-display text-lg font-semibold tracking-tight">
            Waypoint
          </span>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
          <h1 className="font-display text-xl font-semibold">Create your workspace</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Free for teams up to 10 people.
          </p>

          <form className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-mono-data uppercase tracking-wide text-[var(--color-text-faint)] mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jordan Ashworth"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
            <div>
              <label htmlFor="org" className="block text-xs font-mono-data uppercase tracking-wide text-[var(--color-text-faint)] mb-1.5">
                Organization name
              </label>
              <input
                id="org"
                type="text"
                placeholder="ABC Pvt Ltd"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-mono-data uppercase tracking-wide text-[var(--color-text-faint)] mb-1.5">
                Work email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-mono-data uppercase tracking-wide text-[var(--color-text-faint)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <Link
              href="/dashboard"
              className="block w-full text-center px-4 py-2.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Create workspace
            </Link>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
