import { Source, NotebookSummary, Mindmap } from "./types";

// All mock/demo data removed per user request.
// These empty placeholders prevent import errors while you wire real data sources.
export const MOCK_SOURCES: Source[] = [];

export const MOCK_OVERVIEW: NotebookSummary = {
  notebookId: "",
  generatedAt: 0,
  bullets: [],
  keyStats: [],
};

export const MOCK_MINDMAP: Mindmap = {
  notebookId: "",
  generatedAt: 0,
  root: {
    title: "",
    children: [],
  },
};

export const MOCK_SOURCES_ALT: Source[] = [];
export const MOCK_OVERVIEW_ALT: NotebookSummary = {
  notebookId: "",
  generatedAt: 0,
  bullets: [],
  keyStats: [],
};
export const MOCK_MINDMAP_ALT: Mindmap = {
  notebookId: "",
  generatedAt: 0,
  root: { title: "", children: [] },
};
