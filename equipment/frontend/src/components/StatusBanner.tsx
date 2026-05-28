"use client";

import Link from "next/link";

type Status = "pending" | "executing" | "completed" | "failed" | "unknown";

export function StatusBanner({
  status,
  runId,
}: {
  status: Status;
  runId: string;
}) {
  const map: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
    pending: {
      label: "Queued",
      dot: "bg-[color:var(--color-ink-3)]",
      text: "text-[color:var(--color-ink-2)]",
      bg: "bg-[color:var(--color-paper-2)]",
    },
    executing: {
      label: "Running",
      dot: "bg-[color:var(--color-accent)] breathe",
      text: "text-[color:var(--color-accent)]",
      bg: "bg-[color:var(--color-accent-soft)]",
    },
    completed: {
      label: "Complete",
      dot: "bg-[color:var(--color-success)]",
      text: "text-[color:var(--color-success)]",
      bg: "bg-[#e8f5ec]",
    },
    failed: {
      label: "Failed",
      dot: "bg-[color:var(--color-error)]",
      text: "text-[color:var(--color-error)]",
      bg: "bg-[#fdecec]",
    },
    unknown: {
      label: "Loading",
      dot: "bg-[color:var(--color-ink-3)] breathe",
      text: "text-[color:var(--color-ink-2)]",
      bg: "bg-[color:var(--color-paper-2)]",
    },
  };

  const s = map[status];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border border-[color:var(--color-rule)] ${s.bg}`}
    >
      <div className="flex items-center gap-3">
        <span className={`inline-block w-2 h-2 rounded-full ${s.dot}`} />
        <span className={`label-cap ${s.text}`}>{s.label}</span>
        <span className="mono text-xs text-[color:var(--color-ink-3)] hidden sm:inline">
          run · {runId.slice(-12)}
        </span>
      </div>
      {status === "failed" && (
        <Link
          href="/"
          className="label-cap link-underline text-[color:var(--color-error)]"
        >
          Try again →
        </Link>
      )}
    </div>
  );
}
