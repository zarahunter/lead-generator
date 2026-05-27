import { defineConfig } from "@trigger.dev/sdk";

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
});
