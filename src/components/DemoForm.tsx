"use client";

import { useState } from "react";
import ScoreCard from "./ScoreCard";
import TrendChart from "./TrendChart";
import LLMBreakdown from "./LLMBreakdown";

interface ScanResults {
  scores: Array<{
    brand: string;
    score: number;
    mentions: number;
    total: number;
    trend: number;
  }>;
  trends: Array<Record<string, string | number>>;
  llmBreakdown: Array<{
    llm: string;
    score: number;
    mentions: number;
    total: number;
    status?: string;
  }>;
  scans?: Array<{
    llm: string;
    prompt: string;
    brandsFound: string[];
    response: string;
  }>;
  keyword: string;
  mode: "live" | "demo";
  scanCount?: number;
  errors?: Array<{ llm: string; error: string }>;
}

export default function DemoForm() {
  const [brand, setBrand] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !keyword) return;

    setLoading(true);
    setError("");
    setResults(null);

    // Start timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const res = await fetch("/api/scan/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          competitors: competitors.split(",").map((c) => c.trim()).filter(Boolean),
          keyword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Scan failed");
      }
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      clearInterval(timer);
      setLoading(false);
      setElapsed(0);
    }
  };

  const allBrands = results ? results.scores.map((s) => s.brand) : [];
  const isLive = results?.mode === "live";

  return (
    <div id="demo">
      <form onSubmit={handleSubmit} className="glow-card p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold gradient-text">Try It — Scan Your Brand Now</h2>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            LIVE AI SCANNING
          </span>
        </div>
        <p className="text-sm text-[var(--muted)] mb-4">
          We&apos;ll query ChatGPT, Perplexity, and Gemini right now to see if they recommend your brand.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 uppercase tracking-wider">
              Your Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Notion"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 uppercase tracking-wider">
              Competitors (comma-separated)
            </label>
            <input
              type="text"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="e.g., Asana, Monday.com, ClickUp"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 uppercase tracking-wider">
              Category / Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., project management tools"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Querying AI platforms... {elapsed > 0 && `(${elapsed}s)`}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
              </svg>
              Scan AI Visibility (Live)
            </>
          )}
        </button>

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}
      </form>

      {results && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Mode indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            isLive
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400" : "bg-amber-400"}`} />
            {isLive ? (
              <>
                <strong>Live Results</strong> — These are real responses from AI platforms, scanned just now.
                {results.scanCount && ` (${results.scanCount} queries across ${
                  results.llmBreakdown.filter(l => (l.status === "ok" || !l.status) && l.total > 0).length
                } AI platforms)`}
              </>
            ) : (
              <>
                <strong>Demo Mode</strong> — Simulated data shown for preview. Sign up for real AI scanning.
              </>
            )}
          </div>

          {/* Score cards */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
              Citation Scores — &ldquo;{results.keyword}&rdquo;
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.scores.slice(0, 8).map((s, i) => (
                <ScoreCard
                  key={s.brand}
                  brand={s.brand}
                  score={s.score}
                  mentions={s.mentions}
                  total={s.total}
                  trend={s.trend}
                  isPrimary={s.brand === brand}
                  rank={i + 1}
                />
              ))}
            </div>
          </div>

          {/* Trend chart */}
          <TrendChart data={results.trends} brands={allBrands.slice(0, 5)} primaryBrand={brand} />

          {/* LLM breakdown */}
          <LLMBreakdown data={results.llmBreakdown} brand={brand} />

          {/* Raw scan details (only for live mode) */}
          {isLive && results.scans && results.scans.length > 0 && (
            <div className="glow-card p-6">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Raw AI Responses
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {results.scans.map((scan, i) => (
                  <div key={i} className="border border-[var(--card-border)]/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">
                        {scan.llm === "chatgpt" ? "🤖" : scan.llm === "perplexity" ? "🔍" : "✨"}
                      </span>
                      <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                        {scan.llm}
                      </span>
                      <span className="text-xs text-[var(--muted)]">·</span>
                      <span className="text-xs text-[var(--accent-light)]">
                        &ldquo;{scan.prompt}&rdquo;
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mb-2">
                      {scan.response}
                    </p>
                    {scan.brandsFound.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scan.brandsFound.map((b) => (
                          <span
                            key={b}
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              b === brand
                                ? "bg-green-500/20 text-green-400 font-semibold"
                                : "bg-[var(--accent)]/10 text-[var(--accent-light)]"
                            }`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors (if some LLMs failed) */}
          {results.errors && results.errors.length > 0 && (
            <div className="text-xs text-[var(--muted)] bg-[var(--card)] rounded-lg p-3">
              <p className="font-semibold mb-1">Some platforms had issues:</p>
              {results.errors.map((err, i) => (
                <p key={i}>• {err.llm}: {err.error}</p>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="glow-card p-8 text-center pulse-glow">
            <h3 className="text-xl font-bold mb-2">
              {isLive ? "Want Ongoing Monitoring?" : "Want Real-Time Monitoring?"}
            </h3>
            <p className="text-[var(--muted)] mb-4">
              {isLive ? (
                <>
                  You just saw real data. Sign up to <strong>track your scores weekly</strong>, monitor trends, and get alerts when your visibility changes.
                </>
              ) : (
                <>
                  This was simulated data. Sign up to get <strong>real</strong> LLM citation tracking with weekly reports.
                </>
              )}
            </p>
            <a href="#pricing" className="btn-primary inline-block">
              Start Free — No Card Required
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
