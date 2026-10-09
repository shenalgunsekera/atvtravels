import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  clearFailedLogins,
  createSessionToken,
  isAdmin,
  loginAllowed,
  recordFailedLogin,
} from "@/lib/admin-auth";

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

// GET /api/admin/session — is the current browser signed in?
export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}

// POST /api/admin/session — sign in with { password }
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET is not set on the server." }, { status: 500 });
  }
  const ip = clientIp(req);
  if (!loginAllowed(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !checkPassword(password)) {
    recordFailedLogin(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  clearFailedLogins(ip);
  const { token, expires } = createSessionToken();
  const res = NextResponse.json({ authenticated: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  return res;
}

// DELETE /api/admin/session — sign out
export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
