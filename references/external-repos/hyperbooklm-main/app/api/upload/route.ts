import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

// Configure body size limit for PDF uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isPDF = fileName.endsWith(".pdf");
    const isTXT = fileName.endsWith(".txt");
    
    if (!isPDF && !isTXT) {
      return NextResponse.json({ error: "Only PDF and TXT files are supported" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    let text = "";
    let totalPages = 1;

    if (isTXT) {
      // Handle TXT files - just read as text
      text = await file.text();
    } else {
      // Handle PDF files
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Extract text using unpdf
      const result = await extractText(uint8Array);
      text = Array.isArray(result.text) ? result.text.join('\n') : result.text;
      totalPages = result.totalPages;
    }

    return NextResponse.json({
      title: file.name.replace(/\.(pdf|txt)$/i, ""),
      text: text,
      content: text,
      filename: file.name,
      pages: totalPages,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to parse PDF",
      },
      { status: 500 }
    );
  }
}
