"use client";

import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export function Header() {
  return (
    <header className="border-b border-[color:var(--color-rule)] bg-[color:var(--color-paper)]/80 backdrop-blur">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3 group">
          <span className="display text-2xl">
            Lead<span className="italic">Gen</span>
          </span>
          <span className="label-cap text-[color:var(--color-ink-3)] group-hover:text-[color:var(--color-accent)] transition-colors">
            ◆ blueprint v1
          </span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="label-cap link-underline text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
