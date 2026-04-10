import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PipelineResult } from "@/components/PipelineResult";
import { Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Client-side token counting for instant feedback
function countTokens(text: string): number {
  // Rough GPT tokenizer approximation: ~4 chars per token for English, ~1.5 chars per token for Chinese
  const isChinese = /[\u4e00-\u9fff]/.test(text);
  if (isChinese) {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars * 0.7 + otherChars / 4);
  }
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

// Simple in-memory cache for results
const resultCache = new Map<string, any>();

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState<string>("");

  // Real-time token count
  const tokenCount = useMemo(() => countTokens(prompt), [prompt]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const trimmedPrompt = prompt.trim();
    const cacheKey = trimmedPrompt.toLowerCase();

    // Check cache first
    if (resultCache.has(cacheKey)) {
      const cachedResult = resultCache.get(cacheKey);
      setResult({ ...cachedResult, processing_time: 0 }); // Instant from cache
      toast.success("Loaded from cache!");
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress("Analyzing prompt...");

    try {
      const startTime = Date.now();

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const { data, error } = await supabase.functions.invoke("prompt-optimize", {
        body: { prompt: trimmedPrompt },
      });

      clearTimeout(timeoutId);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const endTime = Date.now();
      console.log(`Optimization completed in ${endTime - startTime}ms`);

      // Cache the result with processing time
      const resultWithTime = { ...data, processing_time: endTime - startTime };
      resultCache.set(cacheKey, resultWithTime);
      setResult(resultWithTime);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error(e.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const clearCache = () => {
    resultCache.clear();
    toast.success("Cache cleared!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">PromptSaver</h1>
            <p className="text-xs text-muted-foreground">Optimize tokens via Chinese translation</p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Input */}
        <div className="glass-card p-5 space-y-4">
          <label className="text-sm font-medium text-foreground">Enter your English prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Please help me write a comprehensive and detailed analysis of the current state of artificial intelligence..."
            className="w-full min-h-[120px] bg-muted/50 border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono">
                {tokenCount} tokens • {prompt.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              {resultCache.size > 0 && (
                <button
                  onClick={clearCache}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear cache ({resultCache.size})
                </button>
              )}
            </div>
            <Button onClick={handleSubmit} disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {progress || "Processing pipeline..."}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Optimize Prompt
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pipeline steps visualization when idle */}
        {!result && !loading && (
          <div className="glass-card p-6 space-y-3">
            <p className="text-sm font-medium text-muted-foreground mb-4">Pipeline Steps</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              {[
                "1. Count tokens",
                "2. TF-IDF heatmap",
                "3. Trim prompt",
                "4. Optimize & respond",
              ].map((step, i) => (
                <div key={i} className={`px-3 py-2 rounded-lg border border-step-${i + 1}/20 text-step-${i + 1}/70 bg-step-${i + 1}/5`}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading animation */}
        {loading && (
          <div className="glass-card p-12 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground font-mono animate-pulse-glow">
                {progress || "Running 8-step pipeline..."}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Processing with AI optimization</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && <PipelineResult data={result} />}
      </main>
    </div>
  );
};

export default Index;
