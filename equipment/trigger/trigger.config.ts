import { defineConfig } from "@trigger.dev/sdk";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_fofvgafgxnhqwxhnkapw",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30_000,
      randomize: true,
    },
  },
  dirs: ["./trigger"],
  build: {
    extensions: [
      syncEnvVars(async () => [
        { name: "FIRECRAWL_API_KEY", value: process.env.FIRECRAWL_API_KEY ?? "" },
        { name: "SUPABASE_URL", value: process.env.SUPABASE_URL ?? "" },
        { name: "SUPABASE_SERVICE_ROLE_KEY", value: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "" },
        { name: "ANTHROPIC_API_KEY", value: process.env.ANTHROPIC_API_KEY ?? "" },
      ]),
    ],
  },
});
