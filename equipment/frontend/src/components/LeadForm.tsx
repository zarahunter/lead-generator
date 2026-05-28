"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GenerateLeadsInput, type GenerateLeadsInput as Input } from "@/lib/schema";
import { generateLeadsAction } from "@/app/actions/generate";

const LS_KEY = "lead-gen.last-input";

const defaults: Input = {
  businessDescription: "",
  icp: "",
  leadType: "decision makers",
  region: "",
  count: 5,
};

type FieldErrors = Partial<Record<keyof Input, string>>;

export function LeadForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Input>(defaults);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Restore last-used inputs from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = GenerateLeadsInput.partial().safeParse(JSON.parse(raw));
      if (parsed.success) setValues({ ...defaults, ...parsed.data } as Input);
    } catch {
      // ignore
    }
  }, []);

  function update<K extends keyof Input>(key: K, value: Input[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const result = GenerateLeadsInput.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof Input;
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    startTransition(async () => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(values));
      } catch {
        // ignore
      }

      const result = await generateLeadsAction(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      // Persist token in sessionStorage so the run page can subscribe.
      try {
        sessionStorage.setItem(
          `lead-gen.token.${result.runId}`,
          result.publicAccessToken,
        );
      } catch {
        // ignore
      }
      router.push(`/runs/${result.runId}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field
        label="Business description"
        hint="What your business does. The model uses this to understand context."
        error={errors.businessDescription}
      >
        <textarea
          rows={3}
          value={values.businessDescription}
          onChange={(e) => update("businessDescription", e.target.value)}
          placeholder="e.g. We sell AI-powered sales enablement software to mid-market B2B teams."
          className={inputCls(!!errors.businessDescription)}
        />
      </Field>

      <Field
        label="Ideal customer profile"
        hint="Who you want to reach. Industry, company size, role context."
        error={errors.icp}
      >
        <textarea
          rows={3}
          value={values.icp}
          onChange={(e) => update("icp", e.target.value)}
          placeholder="e.g. SaaS companies, 50–500 employees, B2B, with an outbound sales team."
          className={inputCls(!!errors.icp)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Lead type" error={errors.leadType}>
          <input
            type="text"
            value={values.leadType}
            onChange={(e) => update("leadType", e.target.value)}
            placeholder="decision makers"
            className={inputCls(!!errors.leadType)}
          />
        </Field>

        <Field label="Region (optional)" error={errors.region}>
          <input
            type="text"
            value={values.region ?? ""}
            onChange={(e) => update("region", e.target.value)}
            placeholder="EU, North America, London…"
            className={inputCls(!!errors.region)}
          />
        </Field>
      </div>

      <Field label="How many leads?" error={errors.count}>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={values.count}
            onChange={(e) => update("count", parseInt(e.target.value, 10))}
            className="flex-1 accent-[color:var(--color-accent)]"
          />
          <div className="mono text-2xl tabular-nums w-12 text-right">
            {String(values.count).padStart(2, "0")}
          </div>
        </div>
      </Field>

      {serverError && (
        <p className="text-sm text-[color:var(--color-error)] mono">{serverError}</p>
      )}

      <div className="pt-4 border-t border-[color:var(--color-rule)]">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center gap-3 px-6 py-3 bg-[color:var(--color-ink)] text-[color:var(--color-paper)] rounded-md hover:bg-[color:var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="label-cap text-[color:var(--color-paper)]">
            {pending ? "Triggering" : "Generate leads"}
          </span>
          <span className="mono text-xs opacity-70 group-hover:opacity-100 transition-opacity">
            {pending ? "…" : "→"}
          </span>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label-cap block mb-2">{label}</label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[color:var(--color-ink-3)]">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-[color:var(--color-error)] mono">{error}</p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return [
    "w-full px-3 py-2.5 bg-white rounded-md transition-colors",
    "border",
    hasError
      ? "border-[color:var(--color-error)]"
      : "border-[color:var(--color-rule)] focus:border-[color:var(--color-accent)]",
    "focus:outline-none text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-3)]",
    "font-sans text-sm leading-relaxed resize-none",
  ].join(" ");
}
