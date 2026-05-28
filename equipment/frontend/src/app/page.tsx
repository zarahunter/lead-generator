import { Header } from "@/components/Header";
import { LeadForm } from "@/components/LeadForm";
import { ToastContainer } from "@/components/Toast";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
          <section className="rise mb-12">
            <p className="label-cap mb-4">◇ new run</p>
            <h1 className="display text-5xl sm:text-6xl leading-[0.95]">
              Find <span className="italic">qualified</span> leads,
              <br />
              one brief at a time.
            </h1>
            <p className="mt-6 max-w-xl text-[color:var(--color-ink-2)] leading-relaxed">
              Describe your business and who you want to reach. The system
              searches the open web, extracts up to <span className="mono">10</span>{" "}
              contacts, and shows them here in real time.
            </p>
          </section>

          <section
            className="rise rounded-xl border border-[color:var(--color-rule)] bg-white p-6 sm:p-8 shadow-[0_1px_0_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]"
            style={{ animationDelay: "120ms" }}
          >
            <LeadForm />
          </section>

          <p
            className="rise mt-8 text-xs text-[color:var(--color-ink-3)] mono"
            style={{ animationDelay: "240ms" }}
          >
            ↳ inputs persist locally so re-runs are one keystroke away.
          </p>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
