import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminRequestAuthorized,
  verifyPinConstantTime,
} from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const authorized = isAdminRequestAuthorized(req);
  return NextResponse.json({ authenticated: authorized });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const pin = typeof body?.pin === "string" ? body.pin : "";

    if (!verifyPinConstantTime(pin)) {
      return NextResponse.json(
        { error: "Invalid Admin PIN." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ ok: true, authenticated: true });
    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, authenticated: false });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
