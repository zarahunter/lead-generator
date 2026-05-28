"use client";

import type { Lead } from "@/lib/schema";
import { toast } from "./Toast";

export function LeadCard({
  lead,
  index,
  total,
}: {
  lead: Lead;
  index: number;
  total: number;
}) {
  async function copyEmail() {
    if (!lead.email) return;
    try {
      await navigator.clipboard.writeText(lead.email);
      toast(`Copied · ${lead.email}`);
    } catch {
      toast("Copy failed");
    }
  }

  return (
    <article
      className="group rise border border-[color:var(--color-rule)] rounded-lg p-5 bg-white hover:border-[color:var(--color-ink-2)] transition-colors"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Numbered marker */}
        <div className="mono text-xs text-[color:var(--color-ink-3)] tabular-nums pt-1 shrink-0">
          {String(index + 1).padStart(2, "0")}{" "}
          <span className="text-[color:var(--color-rule)]">/</span>{" "}
          {String(total).padStart(2, "0")}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + title */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-medium text-[color:var(--color-ink)] leading-tight">
              {lead.name}
            </h3>
            {lead.title && (
              <span className="text-sm text-[color:var(--color-ink-2)]">
                {lead.title}
              </span>
            )}
          </div>

          {/* Company + source pill */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[color:var(--color-ink-2)]">
              {lead.company}
            </span>
            <span className="text-[color:var(--color-ink-3)]">·</span>
            <span className="inline-flex items-center gap-1 mono text-[10px] tracking-wider uppercase text-[color:var(--color-ink-3)] border border-[color:var(--color-rule)] rounded-full px-2 py-0.5">
              {lead.source}
            </span>
          </div>

          {/* Snippet */}
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-2)]">
            {lead.snippet}
          </p>

          {/* Actions — reveal on hover, always visible on touch */}
          <div className="mt-4 flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
            {lead.email && (
              <button
                type="button"
                onClick={copyEmail}
                className="label-cap link-underline text-[color:var(--color-ink-2)] hover:text-[color:var(--color-accent)]"
              >
                Copy email
              </button>
            )}
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              className="label-cap link-underline text-[color:var(--color-ink-2)] hover:text-[color:var(--color-accent)]"
            >
              Open source ↗
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
