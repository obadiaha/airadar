"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TrendChartProps {
  data: Array<Record<string, string | number>>;
  brands: string[];
  primaryBrand: string;
}

const COLORS = [
  "#6366f1", // indigo (primary)
  "#f59e0b", // amber
  "#22c55e", // green
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export default function TrendChart({ data, brands, primaryBrand }: TrendChartProps) {
  // Put primary brand first
  const sortedBrands = [primaryBrand, ...brands.filter((b) => b !== primaryBrand)];

  return (
    <div className="glow-card p-6">
      <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
        Citation Share Over Time
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--muted)"
              fontSize={12}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              stroke="var(--muted)"
              fontSize={12}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value}%`, undefined]}
            />
            <Legend />
            {sortedBrands.map((brand, i) => (
              <Line
                key={brand}
                type="monotone"
                dataKey={brand}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={brand === primaryBrand ? 3 : 1.5}
                dot={{ r: brand === primaryBrand ? 4 : 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
