import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import type { Lead } from "./schema.js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
    // Trigger.dev's cloud runtime is Node 21 which lacks native WebSocket.
    // @supabase/supabase-js eagerly initializes a Realtime client in its
    // constructor, so we must provide a `ws` polyfill even though this task
    // only does CRUD. Remove if/when Trigger.dev moves to Node 22+.
    client = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { transport: ws as unknown as never },
    });
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
