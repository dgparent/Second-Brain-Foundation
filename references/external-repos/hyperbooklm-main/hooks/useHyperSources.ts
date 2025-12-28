"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Source } from "@/lib/types";
import { generateId, normalizeUrl } from "@/lib/utils";
import { scrapeWebpage } from "@/lib/api/hyperbrowser";

const STORAGE_KEY = "hyperbooklm-sources";
const MAX_SOURCES = 10;

export function useHyperSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load persisted sources (without fetching again)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Source[] = JSON.parse(stored);
        setSources(parsed);
      }
    } catch (err) {
      console.error("Failed to load sources from localStorage:", err);
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    } catch (err) {
      console.error("Failed to save sources to localStorage:", err);
    }
  }, [sources]);

  const canAddMore = useMemo(() => sources.length < MAX_SOURCES, [sources]);

  const ingestUrls = useCallback((input: string) => {
    const parts = input
      .split(/[\n,\s]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(parts.map(normalizeUrl))).slice(
      0,
      MAX_SOURCES
    );
    return unique;
  }, []);

  const fetchSources = useCallback(
    async (urls: string[]) => {
      const normalized = urls
        .map(normalizeUrl)
        .filter(Boolean)
        .slice(0, MAX_SOURCES);
      if (normalized.length === 0) {
        setError("Please provide at least one valid URL.");
        return;
      }

      setError(null);
      setIsLoading(true);

      // seed pending sources / mark loading
      setSources((prev) => {
        const existingUrls = new Set(prev.map((s) => s.url));
        const toAdd = normalized
          .filter((url) => !existingUrls.has(url))
          .slice(0, MAX_SOURCES - prev.length)
          .map((url) => ({
            id: generateId(),
            url,
            title: undefined,
            content: undefined,
            text: undefined,
            addedAt: Date.now(),
            status: "loading" as const,
          }));
        return [
          ...prev.map((s) =>
            normalized.includes(s.url)
              ? { ...s, status: "loading" as const, error: undefined }
              : s
          ),
          ...toAdd,
        ];
      });

      for (const url of normalized) {
        try {
          const result = await scrapeWebpage(url);
          setSources((prev) =>
            prev.map((s) =>
              s.url === url
                ? {
                    ...s,
                    title: result.title,
                    content: result.content,
                    text: result.text,
                    url: result.url,
                    status: "success",
                    error: undefined,
                  }
                : s
            )
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to scrape source";
          setSources((prev) =>
            prev.map((s) =>
              s.url === url
                ? {
                    ...s,
                    status: "error",
                    error: message,
                  }
                : s
            )
          );
          setError(message);
        }
      }

      setIsLoading(false);
    },
    [setSources]
  );

  const removeSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSources([]);
  }, []);

  const setSourcesDirectly = useCallback((newSources: Source[]) => {
    setSources(newSources);
  }, []);

  return {
    sources,
    isLoading,
    error,
    canAddMore,
    fetchSources,
    ingestUrls,
    removeSource,
    clearAll,
    setSourcesDirectly,
    maxSources: MAX_SOURCES,
  };
}
