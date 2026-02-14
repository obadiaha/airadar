"use client";

import { useState } from "react";
import ScoreCard from "./ScoreCard";
import TrendChart from "./TrendChart";
import LLMBreakdown from "./LLMBreakdown";

interface DemoResults {
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
  }>;
  keyword: string;
}

export default function DemoForm() {
  const [brand, setBrand] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DemoResults | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !keyword) return;

    setLoading(true);
    setError("");

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

      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allBrands = results ? results.scores.map((s) => s.brand) : [];

  return (
    <div id="demo">
      <form onSubmit={handleSubmit} className="glow-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 gradient-text">Try It — Enter Your Brand</h2>
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
              Scanning AI platforms...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
              </svg>
              Scan AI Visibility
            </>
          )}
        </button>

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}
      </form>

      {results && (
        <div className="space-y-8 animate-in fade-in duration-500">
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
          <TrendChart data={results.trends} brands={allBrands} primaryBrand={brand} />

          {/* LLM breakdown */}
          <LLMBreakdown data={results.llmBreakdown} brand={brand} />

          {/* CTA */}
          <div className="glow-card p-8 text-center pulse-glow">
            <h3 className="text-xl font-bold mb-2">Want Real-Time Monitoring?</h3>
            <p className="text-[var(--muted)] mb-4">
              This is a demo with simulated data. Sign up to get <strong>real</strong> LLM citation tracking with weekly reports.
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
