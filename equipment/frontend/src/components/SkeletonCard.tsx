export function SkeletonCard({ index, total }: { index: number; total: number }) {
  return (
    <article className="border border-[color:var(--color-rule)] rounded-lg p-5 bg-white">
      <div className="flex items-start gap-4">
        <div className="mono text-xs text-[color:var(--color-ink-3)] tabular-nums pt-1">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/2 shimmer rounded" />
          <div className="h-3 w-1/3 shimmer rounded" />
          <div className="h-3 w-full shimmer rounded mt-4" />
          <div className="h-3 w-4/5 shimmer rounded" />
        </div>
      </div>
    </article>
  );
}
