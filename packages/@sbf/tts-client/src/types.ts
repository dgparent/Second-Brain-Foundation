/**
 * TTS Client Types
 */

/**
 * Supported TTS providers
 */
export type TTSProvider = 'elevenlabs' | 'openai' | 'google' | 'azure';

/**
 * Voice gender options
 */
export type VoiceGender = 'male' | 'female' | 'neutral';

/**
 * Supported audio output formats
 */
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'opus' | 'pcm';

/**
 * Voice definition from a TTS provider
 */
export interface TTSVoice {
  /** Unique voice identifier (provider-specific) */
  id: string;
  /** Human-readable voice name */
  name: string;
  /** Provider this voice belongs to */
  provider: TTSProvider;
  /** Voice gender */
  gender: VoiceGender;
  /** Primary language code (e.g., 'en', 'en-US') */
  language: string;
  /** Voice style/accent (e.g., 'cheerful', 'professional') */
  style?: string;
  /** Preview audio URL if available */
  previewUrl?: string;
  /** Additional provider-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Request to synthesize speech
 */
export interface TTSRequest {
  /** Text to synthesize */
  text: string;
  /** Voice identifier */
  voiceId: string;
  /** Override provider (auto-detected from voiceId if not specified) */
  provider?: TTSProvider;
  /** Speech speed (0.5 - 2.0, default 1.0) */
  speed?: number;
  /** Speech pitch adjustment (-20 to 20, default 0) */
  pitch?: number;
  /** Output audio format */
  format?: AudioFormat;
  /** Provider-specific options */
  options?: Record<string, unknown>;
}

/**
 * Response from TTS synthesis
 */
export interface TTSResponse {
  /** Audio data buffer */
  audio: Buffer;
  /** Audio format */
  format: AudioFormat;
  /** Estimated duration in seconds */
  duration: number;
  /** Character count of input text */
  characterCount: number;
  /** Provider that generated the audio */
  provider: TTSProvider;
  /** Voice ID used */
  voiceId: string;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * ElevenLabs provider configuration
 */
export interface ElevenLabsConfig {
  apiKey: string;
  /** Model ID (default: eleven_multilingual_v2) */
  modelId?: string;
  /** Voice stability (0-1, default 0.5) */
  stability?: number;
  /** Similarity boost (0-1, default 0.75) */
  similarityBoost?: number;
  /** Style (0-1, default 0.5) */
  style?: number;
}

/**
 * OpenAI TTS provider configuration
 */
export interface OpenAITTSConfig {
  apiKey: string;
  /** Model to use (default: tts-1-hd) */
  model?: 'tts-1' | 'tts-1-hd';
  /** Organization ID (optional) */
  organization?: string;
}

/**
 * Google Cloud TTS provider configuration
 */
export interface GoogleTTSConfig {
  /** Google Cloud project ID */
  projectId: string;
  /** Path to service account key file */
  keyFilePath?: string;
  /** Or credentials object directly */
  credentials?: {
    client_email: string;
    private_key: string;
  };
}

/**
 * Azure Cognitive Services TTS provider configuration
 */
export interface AzureTTSConfig {
  /** Azure subscription key */
  subscriptionKey: string;
  /** Azure region (e.g., 'eastus') */
  region: string;
}

/**
 * Combined provider configuration
 */
export interface TTSProviderConfig {
  elevenlabs?: ElevenLabsConfig;
  openai?: OpenAITTSConfig;
  google?: GoogleTTSConfig;
  azure?: AzureTTSConfig;
}

/**
 * TTS Client options
 */
export interface TTSClientOptions {
  /** Provider configurations */
  providers: TTSProviderConfig;
  /** Default provider to use */
  defaultProvider?: TTSProvider;
  /** Enable automatic fallback to next provider on failure */
  enableFallback?: boolean;
  /** Provider priority order for fallback */
  fallbackOrder?: TTSProvider[];
  /** Cache synthesized audio */
  enableCache?: boolean;
  /** Maximum cache size in bytes */
  maxCacheSize?: number;
}

/**
 * Voice preset for podcast generation
 */
export interface VoicePreset {
  /** Preset name (e.g., 'professional-male', 'friendly-female') */
  name: string;
  /** Voice ID to use */
  voiceId: string;
  /** Provider */
  provider: TTSProvider;
  /** Voice configuration overrides */
  config?: {
    speed?: number;
    pitch?: number;
    stability?: number;
  };
}

/**
 * TTS synthesis event for progress tracking
 */
export interface TTSSynthesisEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  segmentIndex?: number;
  totalSegments?: number;
  charactersSynthesized?: number;
  totalCharacters?: number;
  error?: Error;
}

/**
 * TTS synthesis callback
 */
export type TTSSynthesisCallback = (event: TTSSynthesisEvent) => void;
