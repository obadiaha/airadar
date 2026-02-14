import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface ScanRow {
  keyword: string;
  llm: string;
  brands_found: string;
  created_at: string;
  prompt: string;
}

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Get user's brands
  const brands = db
    .prepare("SELECT name, is_primary FROM brands WHERE user_id = ?")
    .all(user.id) as Array<{ name: string; is_primary: number }>;

  const primaryBrand = brands.find((b) => b.is_primary)?.name || brands[0]?.name || "";
  const brandNames = brands.map((b) => b.name);

  // Get all scans
  const scans = db
    .prepare(
      "SELECT keyword, llm, brands_found, created_at, prompt FROM scans WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(user.id) as ScanRow[];

  if (scans.length === 0) {
    return NextResponse.json({
      scores: [],
      trends: [],
      llmBreakdown: [],
      recentScans: [],
      primaryBrand,
      totalScans: 0,
    });
  }

  // Calculate overall scores
  const scores = brandNames.map((brand) => {
    const mentions = scans.filter((s) => {
      const found: string[] = JSON.parse(s.brands_found);
      return found.includes(brand);
    }).length;
    return {
      brand,
      score: Math.round((mentions / scans.length) * 100),
      mentions,
      total: scans.length,
      trend: 0,
    };
  });
  scores.sort((a, b) => b.score - a.score);

  // LLM breakdown for primary brand
  const llmBreakdown = ["chatgpt", "perplexity", "gemini"].map((llm) => {
    const llmScans = scans.filter((s) => s.llm === llm);
    const mentions = llmScans.filter((s) => {
      const found: string[] = JSON.parse(s.brands_found);
      return found.includes(primaryBrand);
    }).length;
    return {
      llm,
      score: llmScans.length ? Math.round((mentions / llmScans.length) * 100) : 0,
      mentions,
      total: llmScans.length,
    };
  });

  // Trend data - group by week
  const weeklyData: Record<string, Record<string, { mentions: number; total: number }>> = {};
  for (const scan of scans) {
    const date = new Date(scan.created_at);
    // Round to Monday of the week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    const weekKey = date.toISOString().split("T")[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {};
      for (const b of brandNames) {
        weeklyData[weekKey][b] = { mentions: 0, total: 0 };
      }
    }

    const found: string[] = JSON.parse(scan.brands_found);
    for (const b of brandNames) {
      weeklyData[weekKey][b].total++;
      if (found.includes(b)) {
        weeklyData[weekKey][b].mentions++;
      }
    }
  }

  const trends = Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => {
      const point: Record<string, string | number> = { date };
      for (const b of brandNames) {
        point[b] = data[b].total
          ? Math.round((data[b].mentions / data[b].total) * 100)
          : 0;
      }
      return point;
    });

  // Recent scans
  const recentScans = scans.slice(0, 20).map((s) => ({
    keyword: s.keyword,
    llm: s.llm,
    brandsFound: JSON.parse(s.brands_found),
    date: s.created_at,
    prompt: s.prompt,
  }));

  return NextResponse.json({
    scores,
    trends,
    llmBreakdown,
    recentScans,
    primaryBrand,
    totalScans: scans.length,
  });
}
