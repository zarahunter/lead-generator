import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "./schema.js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export type RunStatus = "pending" | "success" | "error";

export async function upsertRun(params: {
  triggerRunId: string;
  input: unknown;
}): Promise<string> {
  const { data, error } = await getClient()
    .from("runs")
    .upsert(
      {
        trigger_run_id: params.triggerRunId,
        input: params.input,
        status: "pending",
      },
      { onConflict: "trigger_run_id" },
    )
    .select("id")
    .single();
  if (error) throw new Error(`runs upsert failed: ${error.message}`);
  return data.id as string;
}

export async function updateRunStatus(runId: string, status: RunStatus): Promise<void> {
  const { error } = await getClient().from("runs").update({ status }).eq("id", runId);
  if (error) throw new Error(`runs update failed: ${error.message}`);
}

export async function replaceLeads(runId: string, leads: Lead[]): Promise<void> {
  const supabase = getClient();
  const del = await supabase.from("leads").delete().eq("run_id", runId);
  if (del.error) throw new Error(`leads delete failed: ${del.error.message}`);
  if (leads.length === 0) return;
  const rows = leads.map((l) => ({
    run_id: runId,
    name: l.name,
    title: l.title ?? null,
    company: l.company,
    url: l.url,
    email: l.email ?? null,
    source: l.source,
    snippet: l.snippet,
  }));
  const { error } = await supabase.from("leads").insert(rows);
  if (error) throw new Error(`leads insert failed: ${error.message}`);
}
