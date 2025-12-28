import { NextRequest, NextResponse } from "next/server";
import { Hyperbrowser } from "@hyperbrowser/sdk";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.HYPERBROWSER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Hyperbrowser API key is missing" },
        { status: 500 }
      );
    }

    const client = new Hyperbrowser({ apiKey });

    const scrapeResult = await client.scrape.startAndWait({
      url,
      sessionOptions: {
        useProxy: true,
        solveCaptchas: true,
        proxyCountry: "US",
      },
    });

    // Extract data from the result
    const data = scrapeResult.data as any;
    const title = data?.metadata?.title || new URL(url).hostname;
    const content = data?.markdown || data?.text || "";
    const text = data?.text || data?.markdown || "";

    return NextResponse.json({
      title,
      content,
      text,
      url,
    });
  } catch (error) {
    console.error("[Scrape] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
