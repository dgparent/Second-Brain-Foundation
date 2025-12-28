import { SlideDeck, Source } from "../types";

export async function generateSlides(
  notebookId: string,
  sources: Source[]
): Promise<SlideDeck> {
  const response = await fetch("/api/gemini/slides", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notebookId, sources }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate slides");
  }

  return response.json();
}
