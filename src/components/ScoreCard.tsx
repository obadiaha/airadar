"use client";

interface ScoreCardProps {
  brand: string;
  score: number;
  mentions: number;
  total: number;
  trend: number;
  isPrimary?: boolean;
  rank: number;
}

export default function ScoreCard({ brand, score, mentions, total, trend, isPrimary, rank }: ScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return "var(--success)";
    if (s >= 40) return "var(--warning)";
    return "var(--danger)";
  };

  const getTrendIcon = (t: number) => {
    if (t > 0) return "↑";
    if (t < 0) return "↓";
    return "→";
  };

  const getTrendColor = (t: number) => {
    if (t > 0) return "text-green-400";
    if (t < 0) return "text-red-400";
    return "text-[var(--muted)]";
  };

  return (
    <div className={`glow-card p-5 ${isPrimary ? "ring-1 ring-[var(--accent)]/50" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted)] bg-[var(--background)] w-6 h-6 rounded-full flex items-center justify-center">
            #{rank}
          </span>
          <h3 className="font-semibold text-sm">{brand}</h3>
          {isPrimary && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent-light)] font-medium">
              YOU
            </span>
          )}
        </div>
        <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
          {getTrendIcon(trend)} {Math.abs(trend)}%
        </span>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}%
        </span>
        <span className="text-xs text-[var(--muted)] mb-1">
          cited in {mentions}/{total} queries
        </span>
      </div>

      <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full animate-fill"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
    </div>
  );
}
