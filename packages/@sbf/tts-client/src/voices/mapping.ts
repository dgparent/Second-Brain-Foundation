/**
 * Voice Mapping Utilities
 *
 * Provides default voice mappings and presets for podcast generation.
 */
import { TTSProvider, TTSVoice, VoicePreset } from '../types';

/**
 * Voice role types for podcast generation
 */
export type VoiceRole = 'host' | 'guest' | 'narrator';

/**
 * Voice mapping configuration
 */
export interface VoiceMappingConfig {
  [role: string]: {
    provider: TTSProvider;
    voiceId: string;
    fallback?: {
      provider: TTSProvider;
      voiceId: string;
    };
  };
}

/**
 * Default voice mapping for podcasts
 */
export const VoiceMapping: VoiceMappingConfig = {
  host: {
    provider: 'openai',
    voiceId: 'alloy',
    fallback: {
      provider: 'elevenlabs',
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
    },
  },
  guest: {
    provider: 'openai',
    voiceId: 'nova',
    fallback: {
      provider: 'elevenlabs',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    },
  },
  narrator: {
    provider: 'openai',
    voiceId: 'onyx',
    fallback: {
      provider: 'elevenlabs',
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    },
  },
};

/**
 * Voice presets for different podcast styles
 */
export const VoicePresets: Record<string, VoicePreset[]> = {
  professional: [
    {
      name: 'professional-host',
      voiceId: 'onyx',
      provider: 'openai',
      config: { speed: 0.95 },
    },
    {
      name: 'professional-guest',
      voiceId: 'nova',
      provider: 'openai',
      config: { speed: 0.95 },
    },
  ],
  casual: [
    {
      name: 'casual-host',
      voiceId: 'alloy',
      provider: 'openai',
      config: { speed: 1.0 },
    },
    {
      name: 'casual-guest',
      voiceId: 'shimmer',
      provider: 'openai',
      config: { speed: 1.0 },
    },
  ],
  energetic: [
    {
      name: 'energetic-host',
      voiceId: 'echo',
      provider: 'openai',
      config: { speed: 1.1 },
    },
    {
      name: 'energetic-guest',
      voiceId: 'fable',
      provider: 'openai',
      config: { speed: 1.1 },
    },
  ],
};

/**
 * Get default voices for a podcast with host and guest
 */
export function getDefaultVoices(): { host: TTSVoice; guest: TTSVoice } {
  return {
    host: {
      id: 'alloy',
      name: 'Alloy',
      provider: 'openai',
      gender: 'neutral',
      language: 'en',
      style: 'Balanced and versatile',
    },
    guest: {
      id: 'nova',
      name: 'Nova',
      provider: 'openai',
      gender: 'female',
      language: 'en',
      style: 'Friendly and upbeat',
    },
  };
}

/**
 * Get recommended voice pairs for podcast generation
 */
export function getRecommendedVoicePairs(): Array<{
  style: string;
  host: TTSVoice;
  guest: TTSVoice;
  description: string;
}> {
  return [
    {
      style: 'professional',
      host: {
        id: 'onyx',
        name: 'Onyx',
        provider: 'openai',
        gender: 'male',
        language: 'en',
        style: 'Deep and authoritative',
      },
      guest: {
        id: 'nova',
        name: 'Nova',
        provider: 'openai',
        gender: 'female',
        language: 'en',
        style: 'Friendly and upbeat',
      },
      description: 'Professional business or educational content',
    },
    {
      style: 'casual',
      host: {
        id: 'alloy',
        name: 'Alloy',
        provider: 'openai',
        gender: 'neutral',
        language: 'en',
        style: 'Balanced and versatile',
      },
      guest: {
        id: 'shimmer',
        name: 'Shimmer',
        provider: 'openai',
        gender: 'female',
        language: 'en',
        style: 'Clear and gentle',
      },
      description: 'Relaxed conversational content',
    },
    {
      style: 'storytelling',
      host: {
        id: 'fable',
        name: 'Fable',
        provider: 'openai',
        gender: 'male',
        language: 'en',
        style: 'Expressive and dramatic',
      },
      guest: {
        id: 'echo',
        name: 'Echo',
        provider: 'openai',
        gender: 'male',
        language: 'en',
        style: 'Warm and clear',
      },
      description: 'Narrative or story-driven content',
    },
  ];
}

/**
 * Select voice based on role and provider availability
 */
export function selectVoiceForRole(
  role: VoiceRole,
  availableProviders: TTSProvider[]
): { provider: TTSProvider; voiceId: string } {
  const mapping = VoiceMapping[role];

  if (!mapping) {
    // Default to OpenAI if role not found
    return { provider: 'openai', voiceId: 'alloy' };
  }

  // Check if primary provider is available
  if (availableProviders.includes(mapping.provider)) {
    return { provider: mapping.provider, voiceId: mapping.voiceId };
  }

  // Try fallback
  if (mapping.fallback && availableProviders.includes(mapping.fallback.provider)) {
    return { provider: mapping.fallback.provider, voiceId: mapping.fallback.voiceId };
  }

  // Use first available provider with default voice
  const provider = availableProviders[0];
  const defaultVoices: Record<TTSProvider, string> = {
    openai: 'alloy',
    elevenlabs: 'pNInz6obpgDQGcFmaJgB',
    google: 'en-US-Neural2-A',
    azure: 'en-US-JennyNeural',
  };

  return { provider, voiceId: defaultVoices[provider] || 'default' };
}
