/**
 * Auth helpers — shared between proxy.ts and server actions.
 * The Blueprint says: middleware (now proxy in Next 16) checks an APP_PASSWORD
 * cookie before any server action runs. Server actions also re-check defensively
 * because proxy matcher gaps can silently bypass them.
 */

export const AUTH_COOKIE = "app_session";

/**
 * Constant-time comparison to avoid timing attacks on the password check.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function getAppPassword(): string {
  const pw = process.env.APP_PASSWORD;
  if (!pw) throw new Error("APP_PASSWORD is not set");
  return pw;
}
