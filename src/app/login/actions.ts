"use server";

import { cookies } from "next/headers";
import { encrypt } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  
  // Hardcoded simple CRM password from environment, or default if missing
  const correctPassword = process.env.CRM_PASSWORD || "northernware";

  if (password !== correctPassword) {
    return { error: "Invalid password" };
  }

  // Create session
  const session = await encrypt({ role: "admin", timestamp: Date.now() });

  const cookieStore = await cookies();
  cookieStore.set("nw_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return { success: true };
}

import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("nw_session");
  redirect("/login");
}
