/**
 * OpenAI TTS Provider
 *
 * Uses OpenAI's TTS API with tts-1 and tts-1-hd models.
 * Fixed set of voices: alloy, echo, fable, onyx, nova, shimmer.
 */
import OpenAI from 'openai';
import { BaseTTSProvider } from './base';
import {
  OpenAITTSConfig,
  TTSProvider,
  TTSRequest,
  TTSResponse,
  TTSVoice,
  AudioFormat,
} from '../types';
import { estimateDuration } from '../utils/audio';

type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
type OpenAIResponseFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';

const OPENAI_VOICES: Array<{
  id: OpenAIVoice;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  description: string;
}> = [
  { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced and versatile' },
  { id: 'echo', name: 'Echo', gender: 'male', description: 'Warm and clear' },
  { id: 'fable', name: 'Fable', gender: 'male', description: 'Expressive and dramatic' },
  { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', gender: 'female', description: 'Friendly and upbeat' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Clear and gentle' },
];

export class OpenAITTSProvider extends BaseTTSProvider {
  readonly name: TTSProvider = 'openai';

  private client: OpenAI;
  private model: 'tts-1' | 'tts-1-hd';

  constructor(config: OpenAITTSConfig) {
    super();
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
    });
    this.model = config.model || 'tts-1-hd';
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI TTS provider not configured');
    }

    // Validate voice
    const validVoices: OpenAIVoice[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(request.voiceId as OpenAIVoice)) {
      throw new Error(
        `Invalid OpenAI voice: ${request.voiceId}. Valid voices: ${validVoices.join(', ')}`
      );
    }

    // Map format to OpenAI format
    const formatMap: Record<AudioFormat, OpenAIResponseFormat> = {
      mp3: 'mp3',
      wav: 'wav',
      ogg: 'opus',
      opus: 'opus',
      pcm: 'pcm',
    };
    const responseFormat = formatMap[request.format || 'mp3'] || 'mp3';

    const speed = Math.max(0.25, Math.min(4.0, request.speed ?? 1.0));

    try {
      const mp3 = await this.client.audio.speech.create({
        model: this.model,
        voice: request.voiceId as OpenAIVoice,
        input: request.text,
        speed,
        response_format: responseFormat,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const duration = estimateDuration(request.text, speed);

      return {
        audio: buffer,
        format: request.format || 'mp3',
        duration,
        characterCount: request.text.length,
        provider: 'openai',
        voiceId: request.voiceId,
        metadata: {
          model: this.model,
          speed,
        },
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI TTS failed: ${error.message}`);
      }
      throw error;
    }
  }

  async listVoices(): Promise<TTSVoice[]> {
    // OpenAI has a fixed set of voices
    return OPENAI_VOICES.map((voice) => ({
      id: voice.id,
      name: voice.name,
      provider: 'openai' as TTSProvider,
      gender: voice.gender,
      language: 'en',
      style: voice.description,
      metadata: {
        model: this.model,
      },
    }));
  }

  getCharacterLimit(): number {
    // OpenAI TTS has a 4096 character limit
    return 4096;
  }

  supportsFormat(format: string): boolean {
    return ['mp3', 'wav', 'opus', 'aac', 'flac', 'pcm'].includes(format);
  }

  /**
   * Get available models
   */
  getAvailableModels(): Array<{ id: string; description: string }> {
    return [
      { id: 'tts-1', description: 'Standard quality, faster' },
      { id: 'tts-1-hd', description: 'High definition quality' },
    ];
  }

  /**
   * Set the model to use
   */
  setModel(model: 'tts-1' | 'tts-1-hd'): void {
    this.model = model;
  }
}
