export interface Source {
  id: string;
  url: string;
  title?: string;
  content?: string; // Markdown content
  text?: string; // Plain text content
  addedAt: number;
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface HyperbrowserScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    text?: string;
    title?: string;
    url?: string;
  };
  error?: string;
}

export interface NotebookSummary {
  notebookId: string;
  generatedAt: number;
  bullets: string[];
  keyStats?: string[];
}

export interface MindmapNode {
  title: string;
  children?: MindmapNode[];
}

export interface Mindmap {
  notebookId: string;
  generatedAt: number;
  root: MindmapNode;
}

export interface Slide {
  title: string;
  bullets: string[];
}

export interface SlideDeck {
  notebookId: string;
  generatedAt: number;
  slides: Slide[];
}

export interface VideoPrompt {
  notebookId: string;
  generatedAt: number;
  durationSec: 30 | 60;
  beats: string[];
  style: "informative";
  voiceOver: boolean;
}

export interface AudioScript {
  notebookId: string;
  generatedAt: number;
  voiceId: string;
  text: string;
}
