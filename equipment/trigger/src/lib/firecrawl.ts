import FirecrawlApp from "@mendable/firecrawl-js";

let client: FirecrawlApp | null = null;

function getClient(): FirecrawlApp {
  if (!client) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not set");
    client = new FirecrawlApp({ apiKey });
  }
  return client;
}

export type SearchHit = {
  url: string;
  title?: string;
  description?: string;
};

export async function search(query: string, limit: number): Promise<SearchHit[]> {
  const res = await getClient().search(query, { limit });
  const data = (res as { data?: SearchHit[] }).data ?? [];
  return data.filter((h) => typeof h.url === "string" && h.url.length > 0);
}

export type ScrapedPage = {
  url: string;
  markdown: string;
  title?: string;
};

export async function scrape(url: string): Promise<ScrapedPage | null> {
  try {
    const res = await getClient().scrapeUrl(url, { formats: ["markdown"] });
    if (!res || !("success" in res) || !res.success) return null;
    const markdown = (res as { markdown?: string }).markdown ?? "";
    if (!markdown) return null;
    const metadata = (res as { metadata?: { title?: string } }).metadata;
    return { url, markdown, title: metadata?.title };
  } catch {
    return null;
  }
}
