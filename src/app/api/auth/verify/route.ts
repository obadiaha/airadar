import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createToken } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const db = getDb();
  const link = db
    .prepare(
      "SELECT * FROM magic_links WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
    )
    .get(token) as { id: string; email: string; token: string } | undefined;

  if (!link) {
    return NextResponse.redirect(
      new URL("/api/auth/login?error=invalid", request.url)
    );
  }

  // Mark as used
  db.prepare("UPDATE magic_links SET used = 1 WHERE id = ?").run(link.id);

  // Create or get user
  let user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(link.email) as { id: string; email: string } | undefined;

  if (!user) {
    const userId = uuid();
    db.prepare(
      "INSERT INTO users (id, email, plan) VALUES (?, ?, 'free')"
    ).run(userId, link.email);
    user = { id: userId, email: link.email };
  }

  // Create JWT
  const jwt = createToken(user);

  // Redirect to dashboard with cookie
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("auth_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
