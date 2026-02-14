"use client";

interface LLMScore {
  llm: string;
  score: number;
  mentions: number;
  total: number;
}

interface LLMBreakdownProps {
  data: LLMScore[];
  brand: string;
}

const LLM_META: Record<string, { name: string; icon: string; color: string }> = {
  chatgpt: { name: "ChatGPT", icon: "🤖", color: "#74aa9c" },
  perplexity: { name: "Perplexity", icon: "🔍", color: "#20b8cd" },
  gemini: { name: "Gemini", icon: "✨", color: "#4285f4" },
};

export default function LLMBreakdown({ data, brand }: LLMBreakdownProps) {
  return (
    <div className="glow-card p-6">
      <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
        {brand}&apos;s Visibility by AI Platform
      </h3>
      <div className="space-y-4">
        {data.map(({ llm, score, mentions, total }) => {
          const meta = LLM_META[llm] || { name: llm, icon: "🔮", color: "#888" };
          return (
            <div key={llm}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-sm font-medium">{meta.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: meta.color }}>
                    {score}%
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    ({mentions}/{total})
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-[var(--background)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full animate-fill transition-all"
                  style={{
                    width: `${score}%`,
                    backgroundColor: meta.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
