"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, getAppPassword, constantTimeEqual } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const submitted = String(formData.get("password") ?? "");
  if (!submitted) return { error: "Password required" };

  const ok = constantTimeEqual(submitted, getAppPassword());
  if (!ok) return { error: "Wrong password" };

  const store = await cookies();
  store.set({
    name: AUTH_COOKIE,
    value: submitted,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  redirect("/login");
}

/**
 * Defensive auth check for server actions — re-verifies the cookie even if
 * the proxy already gated the request. Per Next.js 16 docs: matcher gaps
 * can silently skip Server Functions.
 */
export async function assertAuthed(): Promise<void> {
  const store = await cookies();
  const value = store.get(AUTH_COOKIE)?.value;
  const ok = value ? constantTimeEqual(value, getAppPassword()) : false;
  if (!ok) {
    throw new Error("Unauthorized");
  }
}
