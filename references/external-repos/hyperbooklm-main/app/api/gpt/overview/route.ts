import { NextRequest, NextResponse } from "next/server";
import { Source } from "@/lib/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

function buildContentFromSources(sources: Source[], maxChars = 4000) {
  const payload = sources
    .filter((s) => s.status === "success" && (s.text || s.content))
    .map((s, idx) => {
      const text = (s.text || s.content || "").slice(0, maxChars);
      return `[Source ${idx + 1}] ${s.title ?? s.url}\n${text}`;
    })
    .join("\n\n");
  if (!payload) {
    throw new Error("No source text available for generation.");
  }
  return payload;
}

export async function POST(request: NextRequest) {
  try {
    const { notebookId, sources } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Overview] OpenAI API key is missing");
      return NextResponse.json(
        { error: "OpenAI API key is missing" },
        { status: 500 }
      );
    }

    const model = process.env.OPENAI_SUMMARY_MODEL || DEFAULT_MODEL;
    const content = buildContentFromSources(sources, 3000);

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: 512,
        messages: [
          {
            role: "system",
            content:
              'You summarize user-provided extracts. Respond with JSON {"bullets": string[], "keyStats": string[]}. Be concise, bullet-first, cite source numbers like (Source 1).',
          },
          {
            role: "user",
            content,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Overview] OpenAI API error:", errorText);
      return NextResponse.json(
        { error: errorText || "Failed to generate overview" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    return NextResponse.json({
      notebookId,
      generatedAt: Date.now(),
      bullets: parsed.bullets || [],
      keyStats: parsed.keyStats || [],
    });
  } catch (error) {
    console.error("Overview generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
