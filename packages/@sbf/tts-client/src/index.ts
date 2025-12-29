/**
 * @sbf/tts-client - Multi-provider Text-to-Speech Client
 *
 * Provides a unified interface for multiple TTS providers:
 * - ElevenLabs (premium voices)
 * - OpenAI TTS (tts-1, tts-1-hd)
 * - Google Cloud TTS
 * - Azure Cognitive Services TTS
 */

// Types
export * from './types';

// Providers
export { BaseTTSProvider } from './providers/base';
export { ElevenLabsProvider } from './providers/elevenlabs';
export { OpenAITTSProvider } from './providers/openai';
export { GoogleTTSProvider } from './providers/google';
export { AzureTTSProvider } from './providers/azure';

// Client
export { TTSClient } from './client';

// Voice mapping utilities
export { VoiceMapping, getDefaultVoices } from './voices/mapping';

// Audio utilities
export { estimateDuration, convertAudioFormat } from './utils/audio';
