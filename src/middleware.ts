import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = await verifySession(req.cookies.get(COOKIE)?.value);
  const isPublic = pathname === "/login" || pathname === "/api/auth/login";

  if (!user && !isPublic) {
    if (pathname.startsWith("/api"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (user && pathname === "/login")
    return NextResponse.redirect(new URL("/deals", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
