"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encrypt } from "@/lib/auth";
import { getCrmPassword } from "@/lib/env";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  const correctPassword = getCrmPassword();

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

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("nw_session");
  redirect("/login");
}
