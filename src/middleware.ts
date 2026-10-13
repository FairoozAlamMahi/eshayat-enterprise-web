import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Enforce strict CORS & Origin check on state-changing API requests
  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "Cross-origin request forbidden" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json({ error: "Invalid Origin" }, { status: 403 });
      }
    }
  }

  const res = NextResponse.next();

  // Security Headers
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=()"
  );

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
