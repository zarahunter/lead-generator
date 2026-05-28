"use client";

import Link from "next/link";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { LeadArray, type Lead } from "@/lib/schema";
import { StatusBanner } from "./StatusBanner";
import { LeadCard } from "./LeadCard";
import { SkeletonCard } from "./SkeletonCard";

type Status = "pending" | "executing" | "completed" | "failed" | "unknown";

function normalizeStatus(raw: string | undefined): Status {
  if (!raw) return "unknown";
  const s = raw.toUpperCase();
  if (s === "COMPLETED") return "completed";
  if (s === "FAILED" || s === "CRASHED" || s === "CANCELED" || s === "TIMED_OUT" || s === "SYSTEM_FAILURE")
    return "failed";
  if (
    s === "EXECUTING" ||
    s === "REATTEMPTING" ||
    s === "FROZEN" ||
    s === "INTERRUPTED"
  )
    return "executing";
  if (s === "PENDING" || s === "QUEUED" || s === "WAITING_FOR_DEPLOY" || s === "DELAYED")
    return "pending";
  return "unknown";
}

export function RunView({
  runId,
  accessToken,
  expectedCount,
}: {
  runId: string;
  accessToken: string;
  expectedCount: number;
}) {
  const { run, error } = useRealtimeRun(runId, { accessToken });

  const status = normalizeStatus(run?.status as string | undefined);
  const output = run?.output as { leads?: unknown } | undefined;
  const parsed = output?.leads ? LeadArray.safeParse(output.leads) : null;
  const leads: Lead[] = parsed?.success ? parsed.data : [];

  const isTerminal = status === "completed" || status === "failed";
  const showSkeletons =
    !isTerminal && leads.length === 0 && status !== "unknown";

  return (
    <div className="space-y-6">
      <StatusBanner status={status} runId={runId} />

      {error && (
        <div className="text-sm text-[color:var(--color-error)] mono">
          Realtime connection error: {error.message}
        </div>
      )}

      {showSkeletons && (
        <div className="space-y-3">
          {Array.from({ length: Math.min(expectedCount, 3) }).map((_, i) => (
            <SkeletonCard key={i} index={i} total={expectedCount} />
          ))}
        </div>
      )}

      {leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((lead, i) => (
            <LeadCard key={`${lead.url}-${i}`} lead={lead} index={i} total={leads.length} />
          ))}
        </div>
      )}

      {isTerminal && leads.length === 0 && (
        <div className="rounded-lg border border-dashed border-[color:var(--color-rule)] p-12 text-center">
          <p className="display text-3xl italic text-[color:var(--color-ink-2)]">
            no leads
          </p>
          <p className="mt-3 text-sm text-[color:var(--color-ink-3)]">
            The search returned nothing usable. Try widening your ICP or region.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block label-cap link-underline text-[color:var(--color-accent)]"
          >
            Try again →
          </Link>
        </div>
      )}

      {isTerminal && (
        <div className="pt-6 border-t border-[color:var(--color-rule)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 label-cap text-[color:var(--color-ink-2)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            ← Generate another
          </Link>
        </div>
      )}
    </div>
  );
}
