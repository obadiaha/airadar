import { NextResponse } from "next/server";
import { scanSinglePrompt, getAvailableLLMs } from "@/lib/llm-scanner";

export const maxDuration = 30;

function diagnoseKey(raw: string | undefined, expectedPrefix: string) {
  if (!raw) return { status: "missing", raw: null };
  const trimmed = raw.trim();
  if (!trimmed) return { status: "empty_or_whitespace", rawLength: raw.length, trimmedLength: 0 };
  const validPrefix = trimmed.startsWith(expectedPrefix);
  return {
    status: validPrefix ? "looks_valid" : "unexpected_prefix",
    rawLength: raw.length,
    trimmedLength: trimmed.length,
    prefix: trimmed.substring(0, Math.min(8, trimmed.length)) + "...",
    expectedPrefix,
    hasWhitespace: raw !== trimmed,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "project management tools";
  const brandsParam = searchParams.get("brands") || "Notion,Asana,Monday.com,ClickUp,Trello,Jira";
  const brands = brandsParam.split(",").map((b) => b.trim()).filter(Boolean);
  const prompt = `What are the best ${keyword}?`;

  const llmStatus = getAvailableLLMs();

  // Key diagnostics (safe — only shows prefix/length, never full key)
  const keyDiag = {
    openai: diagnoseKey(process.env.OPENAI_API_KEY, "sk-"),
    perplexity: diagnoseKey(process.env.PERPLEXITY_API_KEY, "pplx-"),
    gemini: diagnoseKey(process.env.GEMINI_API_KEY, "AI"),
  };

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
      keyDiagnostics: keyDiag,
      results: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        llmStatus,
        keyDiagnostics: keyDiag,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
