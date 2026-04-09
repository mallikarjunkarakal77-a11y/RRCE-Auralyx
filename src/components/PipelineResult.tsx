import { StepBadge } from "./StepBadge";
import { HeatmapDisplay } from "./HeatmapDisplay";
import { StatCard } from "./StatCard";
import { TokenComparisonChart } from "./TokenComparisonChart";

interface PipelineResultProps {
  data: {
    original_prompt: string;
    original_tokens: number;
    original_cost: string;
    tfidf_scores: Array<{ word: string; score: number }>;
    trimmed_prompt: string;
    trimmed_tokens: number;
    trimmed_cost: string;
    chinese_tokens: number;
    chinese_cost: string;
    ai_response_english: string;
    tokens_saved: number;
    cost_saved: string;
    savings_percent: number;
  };
}

export function PipelineResult({ data }: PipelineResultProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Final Answer - Chinese steps hidden */}
      <div className="glass-card p-5 space-y-3 glow-primary border-primary/20">
        <StepBadge step={1} label="AI Response" />
        <p className="text-foreground leading-relaxed text-lg">{data.ai_response_english}</p>
        <p className="text-xs text-muted-foreground">Internally optimized via Chinese translation to save {data.savings_percent}% tokens</p>
      </div>

      {/* Step 2: Trimmed prompt */}
      <div className="glass-card p-5 space-y-3">
        <StepBadge step={2} label="Trimmed Prompt" />
        <p className="font-mono text-sm text-foreground">{data.trimmed_prompt}</p>
        <p className="text-xs text-muted-foreground">{data.trimmed_tokens} tokens (saved {data.original_tokens - data.trimmed_tokens} from trimming)</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Original Tokens" value={data.original_tokens} />
        <StatCard label="Optimized Tokens" value={data.chinese_tokens} />
        <StatCard label="Tokens Saved" value={data.tokens_saved} highlight />
        <StatCard label="Cost Saved" value={`$${data.cost_saved}`} suffix={`(${data.savings_percent}%)`} highlight />
      </div>

      {/* Step 3: Token Comparison Chart */}
      <div className="glass-card p-5 space-y-3">
        <StepBadge step={3} label="Token Comparison Chart" />
        <TokenComparisonChart
          originalTokens={data.original_tokens}
          optimizedTokens={data.chinese_tokens}
          tokensSaved={data.tokens_saved}
        />
      </div>

      {/* Step 4: Token count */}
      <div className="glass-card p-5 space-y-3">
        <StepBadge step={4} label="Token Count & Cost" />
        <div className="font-mono text-sm text-muted-foreground">
          <span className="text-foreground">{data.original_tokens}</span> tokens → <span className="text-foreground">${data.original_cost}</span> estimated cost
        </div>
      </div>

      {/* Step 5: Heatmap Chart */}
      <div className="glass-card p-5 space-y-3">
        <StepBadge step={5} label="TF-IDF Importance Heatmap" />
        <HeatmapDisplay words={data.tfidf_scores} />
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(0, 85%, 60%)" }} /> High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(30, 90%, 55%)" }} /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(200, 70%, 55%)" }} /> Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(220, 15%, 45%)" }} /> Filler</span>
        </div>
      </div>
    </div>
  );
}
