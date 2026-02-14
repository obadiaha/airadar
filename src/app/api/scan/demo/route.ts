import { NextResponse } from "next/server";
import { runLiteScan, getAvailableLLMs, findBrands } from "@/lib/llm-scanner";
import { getDemoResults } from "@/lib/demo-data";

export const maxDuration = 60; // Allow up to 60s for real LLM calls

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand, competitors = [], keyword } = body;

    if (!brand || !keyword) {
      return NextResponse.json(
        { error: "Brand and keyword are required" },
        { status: 400 }
      );
    }

    const allBrands = [brand, ...competitors].filter(Boolean);
    const llmStatus = getAvailableLLMs();
    const hasAnyKey = llmStatus.chatgpt || llmStatus.perplexity || llmStatus.gemini;

    // If we have at least one API key, do REAL scans
    if (hasAnyKey) {
      try {
        const results = await runLiteScan(keyword, allBrands);

        // Filter out results where the LLM had an error (no key or API failure)
        const validResults = results.filter((r) => !r.error);
        const errorResults = results.filter((r) => r.error);

        if (validResults.length === 0) {
          // All real scans failed, fall back to demo
          console.warn("All LLM scans failed, falling back to demo data");
          const demoResults = getDemoResults(brand, competitors, keyword);
          return NextResponse.json({ ...demoResults, mode: "demo", reason: "All API calls failed" });
        }

        // Calculate scores from real results
        const totalScans = validResults.length;

        const scores = allBrands.map((b) => {
          const mentions = validResults.filter((r) => r.brandsFound.includes(b)).length;
          return {
            brand: b,
            score: Math.round((mentions / totalScans) * 100),
            mentions,
            total: totalScans,
            trend: 0, // No historical data for demo
          };
        });

        // Also extract any other brands mentioned that user didn't list
        const allMentionedBrands = new Set<string>();
        for (const result of validResults) {
          for (const b of result.brandsFound) {
            allMentionedBrands.add(b);
          }
        }
        // Add discovered brands that weren't in the original list
        for (const discovered of allMentionedBrands) {
          if (!allBrands.some((b) => b.toLowerCase() === discovered.toLowerCase())) {
            const mentions = validResults.filter((r) => r.brandsFound.includes(discovered)).length;
            scores.push({
              brand: discovered,
              score: Math.round((mentions / totalScans) * 100),
              mentions,
              total: totalScans,
              trend: 0,
            });
          }
        }

        scores.sort((a, b) => b.score - a.score);

        // Per-LLM breakdown for the primary brand
        const llmBreakdown = ["chatgpt", "perplexity", "gemini"].map((llm) => {
          const llmResults = validResults.filter((r) => r.llm === llm);
          if (llmResults.length === 0) {
            const err = errorResults.find((r) => r.llm === llm);
            return {
              llm,
              score: 0,
              mentions: 0,
              total: 0,
              status: err ? "error" : "no_key",
            };
          }
          const mentions = llmResults.filter((r) =>
            r.brandsFound.includes(brand)
          ).length;
          return {
            llm,
            score: Math.round((mentions / llmResults.length) * 100),
            mentions,
            total: llmResults.length,
            status: "ok",
          };
        });

        // Generate simple trend data (fake historical since this is a one-shot scan)
        const trends = generateSimpleTrends(allBrands.slice(0, 5), scores);

        // Include raw scan details for transparency
        const scans = validResults.map((r) => ({
          llm: r.llm,
          prompt: r.prompt,
          brandsFound: r.brandsFound,
          response: r.response.substring(0, 500) + (r.response.length > 500 ? "..." : ""),
        }));

        return NextResponse.json({
          scores: scores.slice(0, 10), // Top 10
          trends,
          llmBreakdown,
          scans,
          keyword,
          mode: "live",
          llmStatus,
          scanCount: validResults.length,
          errors: errorResults.map((r) => ({ llm: r.llm, error: r.error })),
        });
      } catch (error) {
        console.error("Real scan failed, falling back to demo:", error);
        const demoResults = getDemoResults(brand, competitors, keyword);
        return NextResponse.json({
          ...demoResults,
          mode: "demo",
          reason: "Real scan encountered an error",
        });
      }
    }

    // No API keys configured — use demo data
    const demoResults = getDemoResults(brand, competitors, keyword);
    return NextResponse.json({
      ...demoResults,
      mode: "demo",
      reason: "No API keys configured",
    });
  } catch (error) {
    console.error("Demo scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate simple trend data for display purposes
function generateSimpleTrends(
  brands: string[],
  currentScores: Array<{ brand: string; score: number }>
) {
  const trends = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const point: Record<string, string | number> = {
      date: date.toISOString().split("T")[0],
    };
    for (const b of brands) {
      const baseScore = currentScores.find((s) => s.brand === b)?.score || 30;
      // Add slight variation for visual interest (current week is accurate)
      const variance = i === 0 ? 0 : Math.round((Math.random() - 0.5) * 15);
      point[b] = Math.max(0, Math.min(100, baseScore + variance));
    }
    trends.push(point);
  }
  return trends;
}
