import { NextRequest, NextResponse } from "next/server";
import { Source } from "@/lib/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini"; // Switch to gpt-4o-mini for reliable JSON

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
      console.error("[Mindmap] OpenAI API key is missing");
      return NextResponse.json(
        { error: "OpenAI API key is missing" },
        { status: 500 }
      );
    }

    // Use gpt-5-nano with full model identifier
    const model = process.env.OPENAI_SUMMARY_MODEL || DEFAULT_MODEL;
    const content = buildContentFromSources(sources, 4000);

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: 2000,
        messages: [
          {
            role: "system",
            content:
              'You produce concise mindmaps. Output ONLY valid JSON with this EXACT structure: {"root": {"title": "Main Topic", "children": [{"title": "Subtopic 1"}, {"title": "Subtopic 2", "children": [{"title": "Detail"}]}]}}. EVERY node MUST have a "title" string property. Keep hierarchy shallow (max 3 levels) and informative.',
          },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Mindmap] OpenAI API error:", errorText);
      return NextResponse.json(
        { error: errorText || "Failed to generate mindmap" },
        { status: response.status }
      );
    }

    const data = await response.json();
    let rawContent = data.choices?.[0]?.message?.content || "{}";
    
    // Cleanup markdown code blocks if present (more robust regex)
    rawContent = rawContent.replace(/```json\s*|\s*```/g, "").trim();

    let parsed;
    try {
        parsed = JSON.parse(rawContent);
    } catch (e) {
        console.error("Failed to parse JSON:", rawContent);
        throw new Error("Failed to parse OpenAI response as JSON");
    }
    
    // Handle case where root object is returned directly or wrapped in "root"
    let rootNode = parsed.root || parsed;
    if (rootNode.title && !rootNode.children) {
        rootNode.children = [];
    }

    // Ensure root node has proper structure
    if (!rootNode || !rootNode.title) {
      console.error("[Mindmap] Invalid root structure:", parsed);
      throw new Error("Invalid mindmap structure returned from OpenAI");
    }

    return NextResponse.json({
      notebookId,
      generatedAt: Date.now(),
      root: rootNode,
    });
  } catch (error) {
    console.error("Mindmap generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
