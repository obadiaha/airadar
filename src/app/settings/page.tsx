"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface User {
  id: string;
  email: string;
  plan: string;
}

interface Brand {
  id: string;
  name: string;
  is_primary: number;
}

interface Keyword {
  id: string;
  keyword: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [primaryBrand, setPrimaryBrand] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [keywords, setKeywords] = useState<string[]>([""]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => {
        if (!r.ok) throw new Error("Not auth");
        return r.json();
      }),
      fetch("/api/brands").then((r) => {
        if (!r.ok) throw new Error("Not auth");
        return r.json();
      }),
    ])
      .then(([u, data]) => {
        setUser(u);
        const primary = (data.brands as Brand[]).find((b) => b.is_primary);
        const comps = (data.brands as Brand[]).filter((b) => !b.is_primary);
        if (primary) setPrimaryBrand(primary.name);
        if (comps.length > 0) setCompetitors(comps.map((c) => c.name));
        if ((data.keywords as Keyword[]).length > 0) {
          setKeywords((data.keywords as Keyword[]).map((k) => k.keyword));
        }
      })
      .catch(() => {
        router.push("/api/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const maxCompetitors = user?.plan === "business" ? 10 : user?.plan === "pro" ? 3 : 1;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const brands = [
        { name: primaryBrand, isPrimary: true },
        ...competitors.filter(Boolean).map((c) => ({ name: c, isPrimary: false })),
      ];

      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brands,
          keywords: keywords.filter(Boolean),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      setMessage("Settings saved successfully!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addCompetitor = () => {
    if (competitors.length < maxCompetitors) {
      setCompetitors([...competitors, ""]);
    }
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    setKeywords([...keywords, ""]);
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-sm text-[var(--muted)] mb-8">
          Configure which brands and keywords to monitor across AI platforms.
        </p>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Primary Brand */}
          <div className="glow-card p-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
              Your Brand
            </h2>
            <input
              type="text"
              value={primaryBrand}
              onChange={(e) => setPrimaryBrand(e.target.value)}
              placeholder="e.g., Notion"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none"
              required
            />
          </div>

          {/* Competitors */}
          <div className="glow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                Competitors ({competitors.filter(Boolean).length}/{maxCompetitors})
              </h2>
              {competitors.length < maxCompetitors && (
                <button
                  type="button"
                  onClick={addCompetitor}
                  className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors"
                >
                  + Add Competitor
                </button>
              )}
            </div>
            <div className="space-y-2">
              {competitors.map((comp, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={comp}
                    onChange={(e) => {
                      const newComps = [...competitors];
                      newComps[i] = e.target.value;
                      setCompetitors(newComps);
                    }}
                    placeholder={`Competitor ${i + 1}`}
                    className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none"
                  />
                  {competitors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCompetitor(i)}
                      className="text-[var(--muted)] hover:text-red-400 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {user?.plan === "free" && (
              <p className="text-xs text-[var(--muted)] mt-3">
                Free plan: 1 competitor.{" "}
                <span className="text-[var(--accent-light)]">Upgrade to Pro for 3 competitors.</span>
              </p>
            )}
          </div>

          {/* Keywords */}
          <div className="glow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                Category Keywords
              </h2>
              <button
                type="button"
                onClick={addKeyword}
                className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors"
              >
                + Add Keyword
              </button>
            </div>
            <div className="space-y-2">
              {keywords.map((kw, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={kw}
                    onChange={(e) => {
                      const newKws = [...keywords];
                      newKws[i] = e.target.value;
                      setKeywords(newKws);
                    }}
                    placeholder="e.g., project management tools"
                    className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none"
                  />
                  {keywords.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyword(i)}
                      className="text-[var(--muted)] hover:text-red-400 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-3">
              These are the categories we&apos;ll ask AI platforms about. Be specific for best results.
            </p>
          </div>

          {/* Plan info */}
          <div className="glow-card p-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
              Your Plan
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold capitalize">{user?.plan}</span>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {user?.plan === "free" && "3 scans/month, 1 competitor"}
                  {user?.plan === "pro" && "Unlimited scans, 3 competitors, weekly reports"}
                  {user?.plan === "business" && "Unlimited scans, 10 competitors, API access"}
                </p>
              </div>
              {user?.plan === "free" && (
                <a href="/#pricing" className="btn-primary text-sm">
                  Upgrade
                </a>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {message && (
              <span
                className={`text-sm ${
                  message.includes("success") ? "text-green-400" : "text-red-400"
                }`}
              >
                {message}
              </span>
            )}
          </div>
        </form>
      </main>
    </>
  );
}
