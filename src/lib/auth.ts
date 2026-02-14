import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDb } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
}

export function createToken(user: { id: string; email: string }): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    return null;
  }
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const db = getDb();
  const user = db.prepare("SELECT id, email, plan FROM users WHERE id = ?").get(payload.id) as AuthUser | undefined;
  return user || null;
}
