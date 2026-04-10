import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface TokenUsageChartProps {
  originalTokens: number;
  trimmedTokens: number;
  chineseTokens: number;
  tokensSaved: number;
}

export function TokenUsageChart({
  originalTokens,
  trimmedTokens,
  chineseTokens,
  tokensSaved,
}: TokenUsageChartProps) {
  const data = [
    {
      name: "Original",
      tokens: originalTokens,
      fill: "#ef4444",
    },
    {
      name: "Trimmed",
      tokens: trimmedTokens,
      fill: "#f97316",
    },
    {
      name: "Optimized",
      tokens: chineseTokens,
      fill: "#10b981",
    },
  ];

  const savingsData = [
    {
      name: "Tokens Saved",
      value: tokensSaved,
      fill: "#3b82f6",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Token Usage Chart */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-medium text-foreground">Token Usage Progression</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
              formatter={(value) => [`${value} tokens`, "Count"]}
            />
            <Bar dataKey="tokens" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-4">
          <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
            <div className="text-red-400">Original</div>
            <div className="text-red-300 font-semibold">{originalTokens}</div>
          </div>
          <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
            <div className="text-orange-400">Trimmed</div>
            <div className="text-orange-300 font-semibold">{trimmedTokens}</div>
          </div>
          <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
            <div className="text-green-400">Optimized</div>
            <div className="text-green-300 font-semibold">{chineseTokens}</div>
          </div>
        </div>
      </div>

      {/* Savings Chart */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-medium text-foreground">Total Tokens Saved</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={savingsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
              formatter={(value) => [`${value} tokens`, "Saved"]}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-center">
          <div className="text-sm text-blue-400">Optimization Results</div>
          <div className="text-2xl font-bold text-blue-300">{tokensSaved} tokens</div>
          <div className="text-xs text-blue-400/70">Reduction: {originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0}%</div>
        </div>
      </div>
    </div>
  );
}
