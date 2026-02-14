import { NextResponse } from "next/server";
import { scanSinglePrompt, getAvailableLLMs, findBrands } from "@/lib/llm-scanner";

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "project management tools";
  const brandsParam = searchParams.get("brands") || "Notion,Asana,Monday.com,ClickUp,Trello,Jira";
  const brands = brandsParam.split(",").map((b) => b.trim()).filter(Boolean);
  const prompt = `What are the best ${keyword}?`;

  const llmStatus = getAvailableLLMs();

  try {
    const results = await scanSinglePrompt(prompt, brands);

    const summary = results.map((r) => ({
      llm: r.llm,
      hasApiKey: llmStatus[r.llm as keyof typeof llmStatus] ?? false,
      success: !r.error,
      error: r.error || null,
      brandsFound: r.brandsFound,
      responseLength: r.response.length,
      responsePreview: r.response.substring(0, 300) + (r.response.length > 300 ? "..." : ""),
    }));

    const allWorking = summary.filter((s) => s.success).length;

    return NextResponse.json({
      status: allWorking === 3 ? "all_working" : allWorking > 0 ? "partial" : "none_working",
      prompt,
      keyword,
      brands,
      llmStatus,
      results: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        llmStatus,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
