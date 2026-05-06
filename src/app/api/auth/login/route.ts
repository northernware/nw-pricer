import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      const response = NextResponse.json({ success: true });
      
      try {
        const cookieStore = await cookies();
        cookieStore.set("nw_auth_session", "authenticated", {
          httpOnly: true,
          secure: true, // Always secure for Vercel/Production
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        });
        return response;
      } catch (cookieError) {
        console.error("Cookie set error:", cookieError);
        return NextResponse.json({ error: "Failed to set session" }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: "Invalid credentials",
      details: !adminEmail || !adminPassword ? "Server configuration missing" : undefined
    }, { status: 401 });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Authentication failed", details: String(error) }, { status: 500 });
  }
}
