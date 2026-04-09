import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encoding_for_model } from "npm:@dqbd/tiktoken@0.4.0";

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
      model: "google/gemini-3-flash-preview",
      messages,
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
                description: "TF-IDF importance scores for each word"
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

const encoder = encoding_for_model("gpt-3.5-turbo") ?? encoding_for_model("cl100k_base");

function countTokens(text: string): number {
  if (!text) return 0;
  return encoder.encode(text).length;
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

    const systemPrompt = `You are a prompt optimization assistant. Given an English prompt, you must:
1. Analyze word importance using TF-IDF scoring (0-1, where 1 = most important). Score EVERY word.
2. Create a trimmed version removing filler words, redundancies, and unnecessary verbosity while preserving meaning.
3. Translate the trimmed prompt to Chinese (Mandarin).
4. Generate a helpful AI response to the prompt IN CHINESE.
5. Translate that Chinese response back to English.

Be thorough and accurate. The Chinese translation should be natural, not literal.`;

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
