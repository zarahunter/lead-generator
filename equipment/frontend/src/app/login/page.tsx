"use client";

import { useActionState } from "react";
import { loginAction } from "../actions/auth";

const initial: { error?: string } = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initial, fd: FormData) => loginAction(fd),
    initial,
  );

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rise">
        <div className="mb-10">
          <p className="label-cap mb-3">Restricted</p>
          <h1 className="display text-5xl">
            Lead <span className="italic">Generator</span>
          </h1>
          <p className="mt-4 text-sm text-[color:var(--color-ink-2)]">
            Sign in with the shared password to continue.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="password" className="label-cap block mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className="w-full px-3 py-2.5 border border-[color:var(--color-rule)] bg-white text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none rounded-md transition-colors"
            />
          </div>

          {state.error && (
            <p className="text-sm text-[color:var(--color-error)] mono">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full px-4 py-2.5 bg-[color:var(--color-ink)] text-[color:var(--color-paper)] font-medium rounded-md hover:bg-[color:var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
