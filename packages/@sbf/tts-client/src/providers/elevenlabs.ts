/**
 * ElevenLabs TTS Provider
 *
 * Premium quality voices with high naturalness.
 * Supports multilingual synthesis and voice cloning.
 */
import { BaseTTSProvider } from './base';
import {
  ElevenLabsConfig,
  TTSProvider,
  TTSRequest,
  TTSResponse,
  TTSVoice,
} from '../types';
import { estimateDuration } from '../utils/audio';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: {
    gender?: string;
    language?: string;
    accent?: string;
    description?: string;
    age?: string;
  };
  preview_url?: string;
  category?: string;
}

interface ElevenLabsVoicesResponse {
  voices: ElevenLabsVoice[];
}

export class ElevenLabsProvider extends BaseTTSProvider {
  readonly name: TTSProvider = 'elevenlabs';

  private apiKey: string;
  private modelId: string;
  private stability: number;
  private similarityBoost: number;
  private style: number;

  constructor(config: ElevenLabsConfig) {
    super();
    this.apiKey = config.apiKey;
    this.modelId = config.modelId || 'eleven_multilingual_v2';
    this.stability = config.stability ?? 0.5;
    this.similarityBoost = config.similarityBoost ?? 0.75;
    this.style = config.style ?? 0.5;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    if (!this.isConfigured()) {
      throw new Error('ElevenLabs provider not configured');
    }

    const speed = request.speed ?? 1.0;

    const response = await fetch(
      `${ELEVENLABS_API_BASE}/text-to-speech/${request.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: request.text,
          model_id: this.modelId,
          voice_settings: {
            stability: this.stability,
            similarity_boost: this.similarityBoost,
            style: this.style,
            use_speaker_boost: true,
          },
          // ElevenLabs doesn't have direct speed control, but we can use it in options
          ...(request.options || {}),
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const error = await response.json();
        errorMessage = error.detail?.message || error.detail || JSON.stringify(error);
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`ElevenLabs TTS failed: ${errorMessage}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const duration = estimateDuration(request.text, speed);

    return {
      audio: audioBuffer,
      format: 'mp3',
      duration,
      characterCount: request.text.length,
      provider: 'elevenlabs',
      voiceId: request.voiceId,
      metadata: {
        modelId: this.modelId,
      },
    };
  }

  async listVoices(): Promise<TTSVoice[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list ElevenLabs voices: ${response.statusText}`);
    }

    const data: ElevenLabsVoicesResponse = await response.json();

    return data.voices.map((voice) => ({
      id: voice.voice_id,
      name: voice.name,
      provider: 'elevenlabs' as TTSProvider,
      gender: this.parseGender(voice.labels?.gender),
      language: voice.labels?.language || 'en',
      style: voice.labels?.description || voice.labels?.accent,
      previewUrl: voice.preview_url,
      metadata: {
        category: voice.category,
        age: voice.labels?.age,
      },
    }));
  }

  private parseGender(gender?: string): 'male' | 'female' | 'neutral' {
    if (!gender) return 'neutral';
    const lower = gender.toLowerCase();
    if (lower === 'male' || lower === 'm') return 'male';
    if (lower === 'female' || lower === 'f') return 'female';
    return 'neutral';
  }

  getCharacterLimit(): number {
    // ElevenLabs has a 5000 character limit per request
    return 5000;
  }

  /**
   * Get voice settings for a specific voice
   */
  async getVoiceSettings(voiceId: string): Promise<{
    stability: number;
    similarityBoost: number;
    style: number;
  }> {
    const response = await fetch(
      `${ELEVENLABS_API_BASE}/voices/${voiceId}/settings`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get voice settings: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      stability: data.stability,
      similarityBoost: data.similarity_boost,
      style: data.style || 0,
    };
  }

  /**
   * Get subscription info including character quota
   */
  async getSubscriptionInfo(): Promise<{
    characterCount: number;
    characterLimit: number;
    nextResetDate: string;
  }> {
    const response = await fetch(`${ELEVENLABS_API_BASE}/user/subscription`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get subscription info: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      characterCount: data.character_count,
      characterLimit: data.character_limit,
      nextResetDate: data.next_character_count_reset_unix
        ? new Date(data.next_character_count_reset_unix * 1000).toISOString()
        : '',
    };
  }
}
