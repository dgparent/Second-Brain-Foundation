"use client";

import { useState, useEffect, useCallback } from "react";
import { Source } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { scrapeWebpage } from "@/lib/api/hyperbrowser";

const STORAGE_KEY = "notebook-lm-sources";
const MAX_SOURCES = 10;

export function useLocalSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sources from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = parsed.map((s: Source) => ({
          ...s,
          status: s.status ?? "success",
          text: s.text ?? s.content,
        }));
        setSources(normalized);
      }
    } catch (err) {
      console.error("Failed to load sources from localStorage:", err);
    }
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    } catch (err) {
      console.error("Failed to save sources to localStorage:", err);
    }
  }, [sources]);

  const addSource = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate URL
        new URL(url);

        // Check if we've reached the limit
        if (sources.length >= MAX_SOURCES) {
          throw new Error(`Maximum of ${MAX_SOURCES} sources allowed`);
        }

        // Check if URL already exists
        if (sources.some((s) => s.url === url)) {
          throw new Error("This source has already been added");
        }

        // Scrape the webpage
        const { title, content, url: scrapedUrl } = await scrapeWebpage(url);

        // Create new source
        const newSource: Source = {
          id: generateId(),
          url: scrapedUrl,
          title,
          content,
          text: content,
          addedAt: Date.now(),
          status: "success",
        };

        setSources((prev) => [...prev, newSource]);
        return newSource;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add source";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sources]
  );

  const removeSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAllSources = useCallback(() => {
    setSources([]);
  }, []);

  return {
    sources,
    isLoading,
    error,
    addSource,
    removeSource,
    clearAllSources,
    canAddMore: sources.length < MAX_SOURCES,
    maxSources: MAX_SOURCES,
  };
}
