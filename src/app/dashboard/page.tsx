"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ScoreCard from "@/components/ScoreCard";
import TrendChart from "@/components/TrendChart";
import LLMBreakdown from "@/components/LLMBreakdown";

interface User {
  id: string;
  email: string;
  plan: string;
}

interface DashboardData {
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
  recentScans: Array<{
    keyword: string;
    llm: string;
    brandsFound: string[];
    date: string;
    prompt: string;
  }>;
  primaryBrand: string;
  totalScans: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => {
        if (!r.ok) throw new Error("Not auth");
        return r.json();
      }),
      fetch("/api/dashboard").then((r) => r.json()),
    ])
      .then(([u, d]) => {
        setUser(u);
        setData(d);
      })
      .catch(() => {
        router.push("/api/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setScanning(true);
    setScanError("");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Scan failed");
      }
      // Refresh dashboard
      const dashRes = await fetch("/api/dashboard");
      setData(await dashRes.json());
      setKeyword("");
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const brands = data?.scores.map((s) => s.brand) || [];

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-[var(--muted)]">
              {data?.totalScans || 0} total scans performed
            </p>
          </div>
          <form onSubmit={handleScan} className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword to scan..."
              className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none w-64"
            />
            <button
              type="submit"
              disabled={scanning}
              className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {scanning ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning...
                </>
              ) : (
                "Run Scan"
              )}
            </button>
          </form>
        </div>

        {scanError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-sm text-red-400">
            {scanError}
          </div>
        )}

        {data && data.totalScans === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2">No scans yet</h2>
            <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
              First, add your brand and competitors in{" "}
              <a href="/settings" className="text-[var(--accent-light)] hover:underline">
                Settings
              </a>
              , then run your first scan above.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Score cards */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Overall Citation Scores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.scores.map((s, i) => (
                  <ScoreCard
                    key={s.brand}
                    brand={s.brand}
                    score={s.score}
                    mentions={s.mentions}
                    total={s.total}
                    trend={s.trend}
                    isPrimary={s.brand === data.primaryBrand}
                    rank={i + 1}
                  />
                ))}
              </div>
            </div>

            {/* Trend chart */}
            {data.trends.length > 1 && (
              <TrendChart
                data={data.trends}
                brands={brands}
                primaryBrand={data.primaryBrand}
              />
            )}

            {/* LLM breakdown */}
            <LLMBreakdown data={data.llmBreakdown} brand={data.primaryBrand} />

            {/* Recent scans */}
            <div className="glow-card p-6">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Recent Scans
              </h3>
              <div className="space-y-2">
                {data.recentScans.map((scan, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-[var(--card-border)]/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {scan.llm === "chatgpt" ? "🤖" : scan.llm === "perplexity" ? "🔍" : "✨"}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{scan.prompt}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {scan.llm.toUpperCase()} · {new Date(scan.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {scan.brandsFound.slice(0, 4).map((b) => (
                        <span
                          key={b}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent-light)]"
                        >
                          {b}
                        </span>
                      ))}
                      {scan.brandsFound.length > 4 && (
                        <span className="text-[10px] text-[var(--muted)]">
                          +{scan.brandsFound.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
