import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "veo-3.1-generate-preview";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing" },
        { status: 500 }
      );
    }

    const model = process.env.VEO_MODEL || DEFAULT_MODEL;
    const res = await fetch(
      `${BASE_URL}/models/${model}:predictLongRunning?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to start Veo job" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const name = data.name;
    if (!name) {
      return NextResponse.json(
        { error: "No operation name returned for Veo job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ operationName: name });
  } catch (error) {
    console.error("Veo start error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
