import { Header } from "@/components/Header";
import { RunBootstrap } from "@/components/RunBootstrap";
import { ToastContainer } from "@/components/Toast";

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <section className="mb-8 rise">
            <p className="label-cap mb-3">◆ run</p>
            <h1 className="display text-4xl leading-tight">
              Watching the <span className="italic">scrape</span>.
            </h1>
            <p className="mt-3 text-sm text-[color:var(--color-ink-2)]">
              Status updates live below. Results appear as the task finishes.
            </p>
          </section>

          <section
            className="rise"
            style={{ animationDelay: "100ms" }}
          >
            {/* expectedCount=10 is the Blueprint cap; skeletons cap at 3 */}
            <RunBootstrap runId={id} expectedCount={10} />
          </section>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
