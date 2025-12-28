import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export async function POST(request: NextRequest) {
  try {
    const { operationName } = await request.json();

    if (!operationName) {
      return NextResponse.json(
        { error: "Operation name is required" },
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

    const res = await fetch(`${BASE_URL}/${operationName}?key=${apiKey}`);
    
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to poll Veo job" },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    if (!data.done) {
      return NextResponse.json({ done: false, operationName });
    }

    const uri =
      data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    
    return NextResponse.json({ 
      done: true, 
      operationName, 
      videoUri: uri 
    });
  } catch (error) {
    console.error("Veo poll error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
