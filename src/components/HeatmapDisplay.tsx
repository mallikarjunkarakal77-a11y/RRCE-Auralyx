import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TfidfWord {
  word: string;
  score: number;
}

interface HeatmapDisplayProps {
  words: TfidfWord[];
}

const getColor = (score: number) => {
  if (score >= 0.7) return "hsl(0, 85%, 60%)";
  if (score >= 0.4) return "hsl(30, 90%, 55%)";
  if (score >= 0.2) return "hsl(200, 70%, 55%)";
  return "hsl(220, 15%, 45%)";
};

export function HeatmapDisplay({ words }: HeatmapDisplayProps) {
  const sorted = [...words].sort((a, b) => b.score - a.score).slice(0, 25);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" domain={[0, 1]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="word"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontFamily: "monospace" }}
            width={55}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--foreground))",
              fontSize: 12,
            }}
            formatter={(value: number) => [value.toFixed(3), "TF-IDF Score"]}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
