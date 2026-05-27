import { logger, schemaTask } from "@trigger.dev/sdk";
import { GenerateLeadsInput, type Lead } from "../src/lib/schema.js";
import { search, scrape, type ScrapedPage } from "../src/lib/firecrawl.js";
import { extractLeads } from "../src/lib/llm.js";
import { upsertRun, replaceLeads, updateRunStatus } from "../src/lib/supabase.js";

const MAX_LEADS = 10;
const SEARCH_RESULTS = 8;

function buildQuery(input: GenerateLeadsInput): string {
  const parts = [input.leadType, input.icp, input.businessDescription];
  if (input.region) parts.push(input.region);
  return parts.filter(Boolean).join(" ");
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function dedupe(leads: Lead[]): Lead[] {
  const seen = new Set<string>();
  const out: Lead[] = [];
  for (const lead of leads) {
    const domain = hostnameOf(lead.url);
    const key = `${domain}|${(lead.email ?? lead.name).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...lead, source: lead.source || domain });
  }
  return out;
}

export const scrapeAndExtract = schemaTask({
  id: "scrape-and-extract",
  schema: GenerateLeadsInput,
  maxDuration: 240,
  run: async (payload) => {
    const query = buildQuery(payload);
    logger.info("firecrawl search", { query });
    const hits = await search(query, SEARCH_RESULTS);
    if (hits.length === 0) {
      logger.warn("no search hits");
      return { leads: [] as Lead[] };
    }

    const scraped = (
      await Promise.all(hits.map((h) => scrape(h.url)))
    ).filter((p): p is ScrapedPage => p !== null);

    logger.info("scraped pages", { ok: scraped.length, total: hits.length });
    if (scraped.length === 0) return { leads: [] as Lead[] };

    const extracted = await extractLeads(payload, scraped);
    const deduped = dedupe(extracted).slice(0, MAX_LEADS);
    logger.info("extracted leads", { extracted: extracted.length, deduped: deduped.length });

    return { leads: deduped };
  },
});

export const generateLeads = schemaTask({
  id: "generate-leads",
  schema: GenerateLeadsInput,
  maxDuration: 300,
  run: async (payload, { ctx }) => {
    logger.info("generate-leads start", { count: payload.count, attempt: ctx.attempt.number });

    const runId = await upsertRun({ triggerRunId: ctx.run.id, input: payload });

    try {
      const result = await scrapeAndExtract.triggerAndWait(payload, {
        idempotencyKey: `scrape-extract:${ctx.run.id}`,
        idempotencyKeyTTL: "1h",
      });
      if (!result.ok) {
        throw new Error(`scrape-and-extract failed: ${result.error}`);
      }
      const { leads } = result.output;

      await replaceLeads(runId, leads);
      await updateRunStatus(runId, "success");

      return { runId, leads };
    } catch (err) {
      await updateRunStatus(runId, "error").catch(() => {});
      throw err;
    }
  },
});
