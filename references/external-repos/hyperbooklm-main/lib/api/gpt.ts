import { AudioScript, Mindmap, NotebookSummary, Source, VideoPrompt } from "../types";

export async function generateOverview(
  notebookId: string,
  sources: Source[]
): Promise<NotebookSummary> {
  const response = await fetch("/api/gpt/overview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notebookId, sources }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate overview");
  }

  return response.json();
}

export async function generateMindmap(
  notebookId: string,
  sources: Source[]
): Promise<Mindmap> {
  const response = await fetch("/api/gpt/mindmap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notebookId, sources }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate mindmap");
  }

  return response.json();
}

export function buildVideoPrompt(
  notebookId: string,
  summary: NotebookSummary,
  durationSec: 30 | 60 = 30
): VideoPrompt {
  return {
    notebookId,
    generatedAt: Date.now(),
    durationSec,
    beats: summary.bullets.slice(0, 5),
    style: "informative",
    voiceOver: false,
  };
}

export function buildAudioScript(
  notebookId: string,
  summary: NotebookSummary,
  voiceId: string
): AudioScript {
  const joined = summary.bullets.join(" ");
  const trimmed = joined.length > 2200 ? joined.slice(0, 2200) : joined;
  return {
    notebookId,
    generatedAt: Date.now(),
    voiceId,
    text: trimmed,
  };
}
