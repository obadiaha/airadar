import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { runFullScan } from "@/lib/llm-scanner";
import { v4 as uuid } from "uuid";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keyword } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // Try to use database — may fail on Vercel serverless
    let db;
    try {
      const { getDb } = await import("@/lib/db");
      db = getDb();
    } catch {
      // Database not available (Vercel serverless) — do scan without storage
      console.warn("Database not available, running scan without storage");
    }

    if (db) {
      // Check usage limits
      if (user.plan === "free") {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const count = db
          .prepare(
            "SELECT COUNT(DISTINCT keyword) as cnt FROM scans WHERE user_id = ? AND created_at >= ?"
          )
          .get(user.id, monthStart.toISOString()) as { cnt: number };

        if (count.cnt >= 3) {
          return NextResponse.json(
            { error: "Free plan limit reached. Upgrade to Pro for unlimited scans." },
            { status: 429 }
          );
        }
      }

      // Get user's brands
      const brands = db
        .prepare("SELECT name FROM brands WHERE user_id = ?")
        .all(user.id) as { name: string }[];

      if (brands.length === 0) {
        return NextResponse.json(
          { error: "No brands configured. Add brands in Settings first." },
          { status: 400 }
        );
      }

      const brandNames = brands.map((b) => b.name);

      // Run the scan
      const results = await runFullScan(keyword, brandNames);

      // Store results
      const insertStmt = db.prepare(
        "INSERT INTO scans (id, user_id, prompt, keyword, llm, response, brands_found, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))"
      );

      const insertMany = db.transaction((scanResults: typeof results) => {
        for (const result of scanResults) {
          insertStmt.run(
            uuid(),
            user.id,
            result.prompt,
            keyword,
            result.llm,
            result.response,
            JSON.stringify(result.brandsFound)
          );
        }
      });

      insertMany(results);

      // Calculate scores
      const primaryBrand = brands.find(() => true)?.name || "";
      const totalScans = results.length;

      const scores = brandNames.map((brand) => {
        const mentions = results.filter((r) => r.brandsFound.includes(brand)).length;
        return {
          brand,
          score: Math.round((mentions / totalScans) * 100),
          mentions,
          total: totalScans,
          trend: 0,
        };
      });

      scores.sort((a, b) => b.score - a.score);

      const llmBreakdown = ["chatgpt", "perplexity", "gemini"].map((llm) => {
        const llmResults = results.filter((r) => r.llm === llm);
        const mentions = llmResults.filter((r) =>
          r.brandsFound.includes(primaryBrand)
        ).length;
        return {
          llm,
          score: Math.round((mentions / llmResults.length) * 100),
          mentions,
          total: llmResults.length,
        };
      });

      return NextResponse.json({
        scores,
        llmBreakdown,
        keyword,
        scanCount: results.length,
        mode: "live",
      });
    } else {
      // No database — just run scan and return results directly
      // Use a default brand list from the request or just scan
      const brandNames = body.brands || ["Your Brand"];
      const results = await runFullScan(keyword, brandNames);
      const totalScans = results.filter((r) => !r.error).length;

      const scores = brandNames.map((brand: string) => {
        const mentions = results.filter((r) => !r.error && r.brandsFound.includes(brand)).length;
        return {
          brand,
          score: totalScans > 0 ? Math.round((mentions / totalScans) * 100) : 0,
          mentions,
          total: totalScans,
          trend: 0,
        };
      });

      scores.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

      const llmBreakdown = ["chatgpt", "perplexity", "gemini"].map((llm) => {
        const llmResults = results.filter((r) => r.llm === llm && !r.error);
        const primaryBrand = brandNames[0];
        const mentions = llmResults.filter((r) => r.brandsFound.includes(primaryBrand)).length;
        return {
          llm,
          score: llmResults.length > 0 ? Math.round((mentions / llmResults.length) * 100) : 0,
          mentions,
          total: llmResults.length,
        };
      });

      return NextResponse.json({
        scores,
        llmBreakdown,
        keyword,
        scanCount: results.filter((r) => !r.error).length,
        mode: "live",
        note: "Results not stored (database unavailable)",
      });
    }
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
