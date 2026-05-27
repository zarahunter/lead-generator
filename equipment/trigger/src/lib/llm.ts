import Anthropic from "@anthropic-ai/sdk";
import { LeadArray, type Lead, type GenerateLeadsInput } from "./schema.js";
import type { ScrapedPage } from "./firecrawl.js";

const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    client = new Anthropic({ apiKey });
  }
  return client;
}

function buildPrompt(input: GenerateLeadsInput, pages: ScrapedPage[]): string {
  const sources = pages
    .map((p, i) => `### Source ${i + 1}\nURL: ${p.url}\nTitle: ${p.title ?? ""}\n\n${p.markdown.slice(0, 8000)}`)
    .join("\n\n---\n\n");

  return `You extract sales leads from scraped web pages.

Business: ${input.businessDescription}
Target ICP: ${input.icp}
Lead type wanted: ${input.leadType}
${input.region ? `Region: ${input.region}\n` : ""}
Return up to ${input.count} leads as strict JSON matching this shape:

[
  {
    "name": "string (required, full person name)",
    "title": "string (optional, role)",
    "company": "string (required)",
    "url": "string (required, the source page URL)",
    "email": "string (optional, only if present in source)",
    "source": "string (required, hostname of url)",
    "snippet": "string (required, 1-2 sentences of context from source)"
  }
]

Rules:
- Only include leads supported by the sources below. Do not invent people or emails.
- Skip generic "info@" / "contact@" emails — those are not leads.
- One lead per person. If the same person appears in multiple sources, pick the best source.
- Return JSON ONLY. No prose, no markdown fences.

SOURCES:

${sources}`;
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }
  return trimmed;
}

async function callModel(prompt: string): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") throw new Error("LLM returned no text");
  return block.text;
}

export async function extractLeads(
  input: GenerateLeadsInput,
  pages: ScrapedPage[],
): Promise<Lead[]> {
  const prompt = buildPrompt(input, pages);
  const raw = await callModel(prompt);
  const parsed = JSON.parse(stripJsonFences(raw));
  return LeadArray.parse(parsed);
}
