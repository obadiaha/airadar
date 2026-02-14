import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const brands = db
    .prepare("SELECT * FROM brands WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC")
    .all(user.id);

  const keywords = db
    .prepare("SELECT * FROM keywords WHERE user_id = ? ORDER BY created_at ASC")
    .all(user.id);

  return NextResponse.json({ brands, keywords });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { brands = [], keywords = [] } = body;

  const db = getDb();

  // Check competitor limits
  const maxCompetitors = user.plan === "business" ? 10 : user.plan === "pro" ? 3 : 1;
  if (brands.length > maxCompetitors + 1) {
    return NextResponse.json(
      { error: `Your plan allows ${maxCompetitors} competitors. Upgrade for more.` },
      { status: 400 }
    );
  }

  const updateAll = db.transaction(() => {
    // Clear existing
    db.prepare("DELETE FROM brands WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM keywords WHERE user_id = ?").run(user.id);

    // Insert brands
    const brandStmt = db.prepare(
      "INSERT INTO brands (id, user_id, name, is_primary) VALUES (?, ?, ?, ?)"
    );
    brands.forEach((brand: { name: string; isPrimary: boolean }) => {
      brandStmt.run(uuid(), user.id, brand.name, brand.isPrimary ? 1 : 0);
    });

    // Insert keywords
    const kwStmt = db.prepare(
      "INSERT INTO keywords (id, user_id, keyword) VALUES (?, ?, ?)"
    );
    keywords.forEach((kw: string) => {
      kwStmt.run(uuid(), user.id, kw);
    });
  });

  updateAll();

  return NextResponse.json({ ok: true });
}
