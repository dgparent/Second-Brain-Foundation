/**
 * usePodcasts Hook
 * 
 * React hook for managing podcast state and API interactions.
 */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { type Podcast, type PodcastGenerateConfig } from '@/components/podcasts';

// =============================================================================
// Types
// =============================================================================

interface UsePodcastsOptions {
  /** Base URL for podcast API */
  apiUrl?: string;
  /** Auto-fetch podcasts on mount */
  autoFetch?: boolean;
  /** Polling interval for progress updates (ms) */
  pollInterval?: number;
}

interface UsePodcastsReturn {
  /** List of podcasts */
  podcasts: Podcast[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Currently generating podcast IDs */
  generatingIds: Set<string>;
  /** Fetch all podcasts */
  fetchPodcasts: () => Promise<void>;
  /** Generate a new podcast */
  generatePodcast: (config: PodcastGenerateConfig) => Promise<string>;
  /** Delete a podcast */
  deletePodcast: (id: string) => Promise<void>;
  /** Cancel podcast generation */
  cancelPodcast: (id: string) => Promise<void>;
  /** Get progress for a specific podcast */
  getProgress: (id: string) => Promise<{ progress: number; stage: string }>;
  /** Retry failed podcast */
  retryPodcast: (id: string) => Promise<void>;
  /** Preview script without generating audio */
  previewScript: (config: Omit<PodcastGenerateConfig, 'voiceConfig' | 'includeBackgroundMusic'>) => Promise<any>;
}

// =============================================================================
// API Client
// =============================================================================

class PodcastApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api/v1/podcasts') {
    this.baseUrl = baseUrl;
  }
  
  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }
    
    return response.json();
  }
  
  async list(page = 1, pageSize = 20): Promise<{ podcasts: Podcast[]; total: number }> {
    return this.fetch(`?page=${page}&page_size=${pageSize}`);
  }
  
  async get(id: string): Promise<Podcast> {
    return this.fetch(`/${id}`);
  }
  
  async generate(config: PodcastGenerateConfig): Promise<{ podcast_id: string }> {
    return this.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        source_ids: config.sourceIds,
        title: config.title,
        insights: config.insights,
        style: config.style,
        target_length: config.targetLength,
        voice_config: config.voiceConfig,
        include_background_music: config.includeBackgroundMusic,
      }),
    });
  }
  
  async delete(id: string): Promise<void> {
    return this.fetch(`/${id}`, { method: 'DELETE' });
  }
  
  async cancel(id: string): Promise<void> {
    return this.fetch(`/${id}/cancel`, { method: 'POST' });
  }
  
  async getProgress(id: string): Promise<{ progress: number; stage: string; message: string }> {
    return this.fetch(`/${id}/progress`);
  }
  
  async previewScript(config: any): Promise<any> {
    return this.fetch('/preview-script', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function usePodcasts(options: UsePodcastsOptions = {}): UsePodcastsReturn {
  const {
    apiUrl = '/api/v1/podcasts',
    autoFetch = true,
    pollInterval = 3000,
  } = options;
  
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  
  const clientRef = useRef(new PodcastApiClient(apiUrl));
  const pollTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // ==========================================================================
  // Polling Logic
  // ==========================================================================
  
  const startPolling = useCallback((podcastId: string) => {
    // Already polling
    if (pollTimersRef.current.has(podcastId)) return;
    
    const poll = async () => {
      try {
        const progress = await clientRef.current.getProgress(podcastId);
        
        // Update podcast in list
        setPodcasts((prev) =>
          prev.map((p) =>
            p.id === podcastId
              ? { ...p, progress: progress.progress, stage: progress.stage }
              : p
          )
        );
        
        // Check if complete or failed
        if (progress.stage === 'complete' || progress.stage === 'failed' || progress.stage === 'cancelled') {
          stopPolling(podcastId);
          setGeneratingIds((prev) => {
            const next = new Set(prev);
            next.delete(podcastId);
            return next;
          });
          
          // Refresh the podcast to get final data
          const updated = await clientRef.current.get(podcastId);
          setPodcasts((prev) =>
            prev.map((p) => (p.id === podcastId ? { ...updated, id: updated.id } : p))
          );
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };
    
    // Initial poll
    poll();
    
    // Set up interval
    const timer = setInterval(poll, pollInterval);
    pollTimersRef.current.set(podcastId, timer);
  }, [pollInterval]);
  
  const stopPolling = useCallback((podcastId: string) => {
    const timer = pollTimersRef.current.get(podcastId);
    if (timer) {
      clearInterval(timer);
      pollTimersRef.current.delete(podcastId);
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollTimersRef.current.forEach((timer) => clearInterval(timer));
      pollTimersRef.current.clear();
    };
  }, []);
  
  // ==========================================================================
  // API Methods
  // ==========================================================================
  
  const fetchPodcasts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await clientRef.current.list();
      setPodcasts(response.podcasts);
      
      // Start polling for any generating podcasts
      response.podcasts.forEach((p) => {
        if (['pending', 'script_generating', 'audio_generating', 'processing'].includes(p.status)) {
          setGeneratingIds((prev) => new Set([...prev, p.id]));
          startPolling(p.id);
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch podcasts');
    } finally {
      setIsLoading(false);
    }
  }, [startPolling]);
  
  const generatePodcast = useCallback(async (config: PodcastGenerateConfig): Promise<string> => {
    setError(null);
    
    try {
      const response = await clientRef.current.generate(config);
      const podcastId = response.podcast_id;
      
      // Add to generating set
      setGeneratingIds((prev) => new Set([...prev, podcastId]));
      
      // Create optimistic entry
      const newPodcast: Podcast = {
        id: podcastId,
        title: config.title || `Podcast from ${config.sourceIds.length} sources`,
        status: 'pending',
        sourceIds: config.sourceIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        stage: 'Queued',
      };
      
      setPodcasts((prev) => [newPodcast, ...prev]);
      
      // Start polling
      startPolling(podcastId);
      
      return podcastId;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate podcast';
      setError(message);
      throw new Error(message);
    }
  }, [startPolling]);
  
  const deletePodcast = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await clientRef.current.delete(id);
      stopPolling(id);
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setPodcasts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete podcast');
      throw e;
    }
  }, [stopPolling]);
  
  const cancelPodcast = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await clientRef.current.cancel(id);
      stopPolling(id);
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      
      // Update status optimistically
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'failed' as const, errorMessage: 'Cancelled by user' } : p
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel podcast');
      throw e;
    }
  }, [stopPolling]);
  
  const getProgress = useCallback(async (id: string) => {
    return clientRef.current.getProgress(id);
  }, []);
  
  const retryPodcast = useCallback(async (id: string) => {
    // For retry, we would need the original config
    // For now, this is a placeholder
    const podcast = podcasts.find((p) => p.id === id);
    if (!podcast) throw new Error('Podcast not found');
    
    // Would need to regenerate with original sources
    // This requires storing the original config or fetching it
    console.log('Retry not fully implemented - would regenerate:', podcast);
  }, [podcasts]);
  
  const previewScript = useCallback(async (config: Omit<PodcastGenerateConfig, 'voiceConfig' | 'includeBackgroundMusic'>) => {
    setError(null);
    
    try {
      return await clientRef.current.previewScript({
        source_ids: config.sourceIds,
        insights: config.insights,
        style: config.style,
        target_length: config.targetLength,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to preview script');
      throw e;
    }
  }, []);
  
  // ==========================================================================
  // Auto-fetch on mount
  // ==========================================================================
  
  useEffect(() => {
    if (autoFetch) {
      fetchPodcasts();
    }
  }, [autoFetch, fetchPodcasts]);
  
  return {
    podcasts,
    isLoading,
    error,
    generatingIds,
    fetchPodcasts,
    generatePodcast,
    deletePodcast,
    cancelPodcast,
    getProgress,
    retryPodcast,
    previewScript,
  };
}

export default usePodcasts;
