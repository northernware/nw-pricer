import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

async function verifySession(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get("nw_session")?.value;
  if (!sessionCookie) return false;
  try {
    await decrypt(sessionCookie);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Internal pricing API — admin session required
  if (pathname.startsWith("/api/calculate")) {
    if (!(await verifySession(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!(await verifySession(request))) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/", "/api/calculate"],
};
