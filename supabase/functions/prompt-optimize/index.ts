import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(messages: Array<{role: string; content: string}>) {
  const resp = await fetch(AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-flash-1.5", // Faster model
      messages,
      temperature: 0.3, // Lower temperature for faster, more consistent responses
      max_tokens: 2000, // Limit response length
      tools: [{
        type: "function",
        function: {
          name: "process_prompt",
          description: "Process prompt optimization pipeline",
          parameters: {
            type: "object",
            properties: {
              tfidf_scores: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string" },
                    score: { type: "number", description: "0-1 importance score" },
                  },
                  required: ["word", "score"],
                },
                description: "TF-IDF importance scores for top 20 words only"
              },
              trimmed_prompt: { type: "string", description: "Prompt with filler/redundant words removed" },
              trimmed_prompt_chinese: { type: "string", description: "Chinese translation of trimmed prompt" },
              ai_response_chinese: { type: "string", description: "AI response to the prompt in Chinese" },
              ai_response_english: { type: "string", description: "English translation of the Chinese AI response" },
            },
            required: ["tfidf_scores", "trimmed_prompt", "trimmed_prompt_chinese", "ai_response_chinese", "ai_response_english"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "process_prompt" } },
    }),
  });

  if (!resp.ok) {
    const status = resp.status;
    const text = await resp.text();
    console.error("AI error:", status, text);
    if (status === 429) throw new Error("Rate limited - please try again later");
    if (status === 402) throw new Error("Credits exhausted - please add funds in Settings > Workspace > Usage");
    throw new Error("AI gateway error");
  }

  return resp.json();
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const originalTokens = countTokens(prompt);
    const costPerToken = 0.00001; // ~$10/1M tokens

    const systemPrompt = `You are a prompt optimization assistant. Process this English prompt efficiently:

1. TF-IDF Analysis: Score TOP 20 most important words only (0-1 scale, 1=most important)
2. Trim: Remove filler words, redundancies, keep core meaning - be aggressive but preserve intent
3. Chinese Translation: Natural Mandarin translation of trimmed prompt (keep it concise)
4. AI Response: Generate helpful response in Chinese (keep under 200 words)
5. English Translation: Translate Chinese response back to English

Focus on SPEED and ACCURACY. Be concise but thorough.`;

    const result = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Process this prompt: "${prompt}"` },
    ]);

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const data = JSON.parse(toolCall.function.arguments);
    
    const trimmedTokens = countTokens(data.trimmed_prompt);
    const chineseTokens = countTokens(data.trimmed_prompt_chinese);

    return new Response(JSON.stringify({
      original_prompt: prompt,
      original_tokens: originalTokens,
      original_cost: (originalTokens * costPerToken).toFixed(6),
      tfidf_scores: data.tfidf_scores,
      trimmed_prompt: data.trimmed_prompt,
      trimmed_tokens: trimmedTokens,
      trimmed_cost: (trimmedTokens * costPerToken).toFixed(6),
      chinese_prompt: data.trimmed_prompt_chinese,
      chinese_tokens: chineseTokens,
      chinese_cost: (chineseTokens * costPerToken).toFixed(6),
      ai_response_chinese: data.ai_response_chinese,
      ai_response_english: data.ai_response_english,
      tokens_saved: originalTokens - chineseTokens,
      cost_saved: ((originalTokens - chineseTokens) * costPerToken).toFixed(6),
      savings_percent: Math.round(((originalTokens - chineseTokens) / originalTokens) * 100),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
