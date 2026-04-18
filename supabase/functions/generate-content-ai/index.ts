// Edge function: generate-content-ai
// Takes a yoga book/article/video transcript and returns structured AI outputs
// using Lovable AI Gateway with tool-calling for reliable JSON.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a scholarly editor specializing in yoga, vedanta, and Indian spiritual texts.
You produce respectful, accurate, and accessible content. Sanskrit terms should keep IAST diacritics where natural.
Hindi output must use Devanagari script. English output must be clear and readable.
NEVER fabricate sources, dates, or attributions. If the source text is too short, do your best with what's given.`;

const TOOL = {
  type: "function",
  function: {
    name: "produce_yoga_content_pack",
    description:
      "Produce all derivative content for a yoga book, article, video transcript, or podcast.",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "A polished ~150-word summary of the source content.",
        },
        key_takeaways: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: { type: "string" },
          description: "Exactly 5 concise key takeaway bullets.",
        },
        outline: {
          type: "string",
          description:
            "A chapter / section outline as a markdown bulleted list with sub-bullets where helpful.",
        },
        seo_tags: {
          type: "array",
          minItems: 10,
          maxItems: 10,
          items: { type: "string" },
          description: "Exactly 10 SEO tags / keyphrases.",
        },
        yoga_tags: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: { type: "string" },
          description:
            "Exactly 5 yoga-topic tags (e.g. 'Hatha Yoga', 'Pranayama', 'Bhakti', 'Vedanta').",
        },
        podcast_script: {
          type: "string",
          description:
            "A short single-host podcast script (~250 words) with a warm intro, 3 main beats, and a closing line. Plain text, speakable.",
        },
        beginner_version: {
          type: "string",
          description:
            "A simplified rewrite of the core teaching for absolute beginners, ~200 words, friendly tone, no jargon (or jargon explained).",
        },
        translation_hi: {
          type: "string",
          description:
            "Full Devanagari Hindi translation of the summary section.",
        },
        translation_en: {
          type: "string",
          description:
            "Clean English translation/restatement of the summary (useful when source is non-English).",
        },
      },
      required: [
        "summary",
        "key_takeaways",
        "outline",
        "seo_tags",
        "yoga_tags",
        "podcast_script",
        "beginner_version",
        "translation_hi",
        "translation_en",
      ],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const sourceText: string = (body?.sourceText ?? "").toString();
    const title: string = (body?.title ?? "").toString();
    const contentType: string = (body?.contentType ?? "content").toString();

    if (!sourceText || sourceText.trim().length < 40) {
      return new Response(
        JSON.stringify({
          error:
            "sourceText is required and must be at least 40 characters (paste the transcript / description / body).",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (sourceText.length > 60000) {
      return new Response(
        JSON.stringify({ error: "sourceText is too long (max 60000 chars)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userPrompt = `Content type: ${contentType}
Title: ${title || "(untitled)"}

Source text:
"""
${sourceText}
"""

Produce the full content pack by calling the produce_yoga_content_pack tool.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL],
        tool_choice: {
          type: "function",
          function: { name: "produce_yoga_content_pack" },
        },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiRes.status === 402) {
      return new Response(
        JSON.stringify({
          error:
            "AI credits exhausted. Add credits in Lovable workspace settings to continue.",
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      console.error("No tool call in AI response", JSON.stringify(aiJson).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "AI did not return structured output." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: any;
    try {
      parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    } catch (e) {
      console.error("Failed to parse tool arguments", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON from AI." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ data: parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-content-ai error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
