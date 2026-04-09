import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PipelineResult } from "@/components/PipelineResult";
import { CO2Emissions } from "@/components/CO2Emissions";
import { Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("prompt-optimize", {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <img src="/ChatGPT Image Apr 9, 2026, 05_59_40 PM.png" alt="TokenScope Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">TokenScope</h1>
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
            <span className="text-xs text-muted-foreground font-mono">
              {prompt.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <Button onClick={handleSubmit} disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing pipeline...
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
            <p className="text-sm text-muted-foreground font-mono animate-pulse-glow">Running 8-step pipeline...</p>
          </div>
        )}

        {/* Results */}
        {result && <PipelineResult data={result} />}
      </main>

      {/* CO2 Emissions Display */}
      {result && (
        <CO2Emissions
          promptTokens={result.original_tokens}
          responseTokens={result.chinese_tokens}
        />
      )}
    </div>
  );
};

export default Index;
