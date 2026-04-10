import { StepBadge } from "./StepBadge";
import { HeatmapDisplay } from "./HeatmapDisplay";
import { StatCard } from "./StatCard";
import { TokenUsageChart } from "./TokenUsageChart";

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
    processing_time?: number; // Add processing time
  };
}

export function PipelineResult({ data }: PipelineResultProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Original Tokens" value={data.original_tokens} />
        <StatCard label="Optimized Tokens" value={data.chinese_tokens} />
        <StatCard label="Tokens Saved" value={data.tokens_saved} highlight />
        <StatCard label="Cost Saved" value={`$${data.cost_saved}`} suffix={`(${data.savings_percent}%)`} highlight />
      </div>

      {/* Performance indicator */}
      {data.processing_time && (
        <div className="glass-card p-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Processed in {data.processing_time}ms</span>
          </div>
        </div>
      )}

      {/* Trimmed Prompt and AI Response Section */}
      <div className="glass-card p-5 space-y-4 border-border/70">
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trimmed Prompt</p>
            <p className="font-mono text-sm text-foreground whitespace-pre-wrap">{data.trimmed_prompt}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI Response</p>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{data.ai_response_english}</p>
          </div>
        </div>
      </div>

      {/* Token Usage Chart Panel */}
      <TokenUsageChart
        originalTokens={data.original_tokens}
        trimmedTokens={data.trimmed_tokens}
        chineseTokens={data.chinese_tokens}
        tokensSaved={data.tokens_saved}
      />

      {/* Step 1: Token count */}
      <div className="glass-card p-5 space-y-3">
        <StepBadge step={1} label="Token Count & Cost" />
        <div className="font-mono text-sm text-muted-foreground">
          <span className="text-foreground">{data.original_tokens}</span> tokens → <span className="text-foreground">${data.original_cost}</span> estimated cost
        </div>
      </div>

      {/* Step 2: Heatmap Chart */}
      <div className="glass-card p-5 space-y-3">
        <StepBadge step={2} label="TF-IDF Importance Heatmap" />
        <HeatmapDisplay words={data.tfidf_scores} />
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(0, 85%, 60%)" }} /> High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(30, 90%, 55%)" }} /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(200, 70%, 55%)" }} /> Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "hsl(220, 15%, 45%)" }} /> Filler</span>
        </div>
      </div>

      {/* Step 3: Trimmed prompt */}
      <div className="glass-card p-5 space-y-3">
        <StepBadge step={3} label="Trimmed Prompt" />
        <p className="font-mono text-sm text-foreground">{data.trimmed_prompt}</p>
        <p className="text-xs text-muted-foreground">{data.trimmed_tokens} tokens (saved {data.original_tokens - data.trimmed_tokens} from trimming)</p>
      </div>

      {/* Final Answer - Chinese steps hidden */}
      <div className="glass-card p-5 space-y-3 glow-primary border-primary/20">
        <StepBadge step={4} label="AI Response" />
        <p className="text-foreground leading-relaxed text-lg">{data.ai_response_english}</p>
        <p className="text-xs text-muted-foreground">Internally optimized via Chinese translation to save {data.savings_percent}% tokens</p>
      </div>
    </div>
  );
}
