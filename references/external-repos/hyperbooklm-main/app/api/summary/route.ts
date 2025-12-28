import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json();
    
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
    }

    if (!context) {
      return NextResponse.json({ summary: "No content to summarize." });
    }

    const openai = new OpenAI({ apiKey });
    const model = "gpt-4o-mini"; // Efficient model without reasoning overhead

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
            role: "system", 
            content: "You are an expert research assistant. Analyze the provided context and provide a comprehensive summary. \n\nStructure:\n1. A brief 1-2 sentence overview.\n2. 3-5 key bullet points highlighting the most important facts or insights.\n3. A concluding sentence.\n\nKeep it professional, concise, and easy to read." 
        },
        { role: "user", content: `Context:\n${context}` }
      ],
      max_completion_tokens: 1000,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content;
    
    if (!summary) {
      console.error("[Summary] Empty response from OpenAI");
      throw new Error("OpenAI returned empty summary content");
    }
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[Summary] Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
