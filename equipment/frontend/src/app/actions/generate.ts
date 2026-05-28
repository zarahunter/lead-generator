"use server";

import { tasks } from "@trigger.dev/sdk";
import { GenerateLeadsInput, type GenerateLeadsInput as Input } from "@/lib/schema";
import { assertAuthed } from "./auth";

export type GenerateResult =
  | { ok: true; runId: string; publicAccessToken: string }
  | { ok: false; error: string };

/**
 * Triggers the `generate-leads` task on Trigger.dev.
 * The task itself re-validates the payload (Blueprint: never trust the client).
 * We additionally validate here so the user sees zod errors before round-trip.
 */
export async function generateLeadsAction(raw: unknown): Promise<GenerateResult> {
  await assertAuthed();

  const parsed = GenerateLeadsInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const payload: Input = parsed.data;

  try {
    const handle = await tasks.trigger("generate-leads", payload);
    return {
      ok: true,
      runId: handle.id,
      publicAccessToken: handle.publicAccessToken,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to trigger task";
    return { ok: false, error: message };
  }
}
