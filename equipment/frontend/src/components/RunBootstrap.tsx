"use client";

import { useEffect, useState } from "react";
import { RunView } from "./RunView";

/**
 * Reads the publicAccessToken from sessionStorage (written by the form on
 * submit). If absent (e.g. opened in a new tab, bookmarked, refreshed),
 * we render a friendly fallback asking the user to start a new run.
 *
 * This avoids a server-side token mint and keeps the runs page simple.
 */
export function RunBootstrap({
  runId,
  expectedCount,
}: {
  runId: string;
  expectedCount: number;
}) {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(`lead-gen.token.${runId}`);
      setToken(t);
    } catch {
      setToken(null);
    }
  }, [runId]);

  if (token === undefined) {
    return (
      <div className="text-sm text-[color:var(--color-ink-3)] mono">loading…</div>
    );
  }

  if (token === null) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--color-rule)] p-8 text-center">
        <p className="display text-2xl italic text-[color:var(--color-ink-2)]">
          can&apos;t reconnect
        </p>
        <p className="mt-3 text-sm text-[color:var(--color-ink-3)]">
          The realtime token for this run isn&apos;t in this browser session.
          Run pages can only be viewed in the tab that started the run.
        </p>
        <a
          href="/"
          className="mt-6 inline-block label-cap link-underline text-[color:var(--color-accent)]"
        >
          Start a new run →
        </a>
      </div>
    );
  }

  return <RunView runId={runId} accessToken={token} expectedCount={expectedCount} />;
}
