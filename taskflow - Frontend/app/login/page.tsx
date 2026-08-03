import Link from "next/link";
import { Compass } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Compass size={22} className="text-[var(--color-accent)]" strokeWidth={2.25} />
          <span className="font-display text-lg font-semibold tracking-tight">
            Waypoint
          </span>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
          <h1 className="font-display text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Log in to pick up where you left off.
          </p>

          <form className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-mono-data uppercase tracking-wide text-[var(--color-text-faint)] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-mono-data uppercase tracking-wide text-[var(--color-text-faint)]">
                  Password
                </label>
                <Link href="#" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <Link
              href="/dashboard"
              className="block w-full text-center px-4 py-2.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Log in
            </Link>
          </form>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-text-faint)] font-mono-data uppercase">or</span>
            <span className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <button
            type="button"
            className="w-full px-4 py-2.5 rounded-md border border-[var(--color-border)] text-sm hover:bg-white/[0.03] transition-colors"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
          New to Waypoint?{" "}
          <Link href="/register" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
