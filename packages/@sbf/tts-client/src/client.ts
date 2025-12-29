/**
 * TTS Client
 *
 * Unified client for multiple TTS providers with fallback support.
 */
import {
  TTSProvider,
  TTSProviderConfig,
  TTSRequest,
  TTSResponse,
  TTSVoice,
  TTSClientOptions,
  TTSSynthesisCallback,
  TTSSynthesisEvent,
} from './types';
import { BaseTTSProvider } from './providers/base';
import { ElevenLabsProvider } from './providers/elevenlabs';
import { OpenAITTSProvider } from './providers/openai';
import { GoogleTTSProvider } from './providers/google';
import { AzureTTSProvider } from './providers/azure';
import { splitTextIntoChunks, mergeAudioBuffers } from './utils/audio';

/**
 * Multi-provider TTS Client
 */
export class TTSClient {
  private providers: Map<TTSProvider, BaseTTSProvider> = new Map();
  private defaultProvider: TTSProvider;
  private enableFallback: boolean;
  private fallbackOrder: TTSProvider[];

  constructor(options: TTSClientOptions) {
    this.enableFallback = options.enableFallback ?? true;
    this.fallbackOrder = options.fallbackOrder || ['openai', 'elevenlabs', 'google', 'azure'];

    // Initialize configured providers
    this.initializeProviders(options.providers);

    // Set default provider
    this.defaultProvider = options.defaultProvider || this.getFirstAvailableProvider();
  }

  /**
   * Initialize providers from configuration
   */
  private initializeProviders(config: TTSProviderConfig): void {
    if (config.elevenlabs?.apiKey) {
      this.providers.set('elevenlabs', new ElevenLabsProvider(config.elevenlabs));
    }

    if (config.openai?.apiKey) {
      this.providers.set('openai', new OpenAITTSProvider(config.openai));
    }

    if (config.google?.projectId) {
      this.providers.set('google', new GoogleTTSProvider(config.google));
    }

    if (config.azure?.subscriptionKey) {
      this.providers.set('azure', new AzureTTSProvider(config.azure));
    }
  }

  /**
   * Get the first available provider based on fallback order
   */
  private getFirstAvailableProvider(): TTSProvider {
    for (const provider of this.fallbackOrder) {
      if (this.providers.has(provider) && this.providers.get(provider)!.isConfigured()) {
        return provider;
      }
    }

    // Return first configured provider
    for (const [name, provider] of this.providers) {
      if (provider.isConfigured()) {
        return name;
      }
    }

    throw new Error('No TTS providers configured');
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const providerName = request.provider || this.defaultProvider;
    const providersToTry = this.enableFallback
      ? this.getProviderOrder(providerName)
      : [providerName];

    let lastError: Error | null = null;

    for (const name of providersToTry) {
      const provider = this.providers.get(name);

      if (!provider || !provider.isConfigured()) {
        continue;
      }

      try {
        // Check character limit
        const charLimit = provider.getCharacterLimit();
        if (request.text.length > charLimit) {
          // Split into chunks and synthesize each
          return await this.synthesizeLongText(request, provider);
        }

        return await provider.synthesize(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`TTS provider ${name} failed:`, lastError.message);

        if (!this.enableFallback) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('All TTS providers failed');
  }

  /**
   * Synthesize long text by splitting into chunks
   */
  private async synthesizeLongText(
    request: TTSRequest,
    provider: BaseTTSProvider
  ): Promise<TTSResponse> {
    const charLimit = provider.getCharacterLimit();
    const chunks = splitTextIntoChunks(request.text, charLimit);

    const audioBuffers: Buffer[] = [];
    let totalDuration = 0;

    for (const chunk of chunks) {
      const response = await provider.synthesize({
        ...request,
        text: chunk,
      });

      audioBuffers.push(response.audio);
      totalDuration += response.duration;
    }

    // Merge audio buffers
    const mergedAudio = await mergeAudioBuffers(audioBuffers);

    return {
      audio: mergedAudio,
      format: request.format || 'mp3',
      duration: totalDuration,
      characterCount: request.text.length,
      provider: provider.name,
      voiceId: request.voiceId,
      metadata: {
        chunks: chunks.length,
      },
    };
  }

  /**
   * Synthesize multiple segments with progress callback
   */
  async synthesizeSegments(
    segments: Array<{ text: string; voiceId: string; provider?: TTSProvider }>,
    callback?: TTSSynthesisCallback
  ): Promise<TTSResponse[]> {
    const results: TTSResponse[] = [];
    const totalCharacters = segments.reduce((sum, s) => sum + s.text.length, 0);
    let synthesizedCharacters = 0;

    callback?.({
      type: 'start',
      totalSegments: segments.length,
      totalCharacters,
    });

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      try {
        callback?.({
          type: 'progress',
          segmentIndex: i,
          totalSegments: segments.length,
          charactersSynthesized: synthesizedCharacters,
          totalCharacters,
        });

        const response = await this.synthesize({
          text: segment.text,
          voiceId: segment.voiceId,
          provider: segment.provider,
        });

        results.push(response);
        synthesizedCharacters += segment.text.length;
      } catch (error) {
        callback?.({
          type: 'error',
          segmentIndex: i,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    }

    callback?.({
      type: 'complete',
      totalSegments: segments.length,
      charactersSynthesized: synthesizedCharacters,
      totalCharacters,
    });

    return results;
  }

  /**
   * List voices from all configured providers or a specific provider
   */
  async listVoices(providerName?: TTSProvider): Promise<TTSVoice[]> {
    if (providerName) {
      const provider = this.providers.get(providerName);
      if (!provider || !provider.isConfigured()) {
        return [];
      }
      return provider.listVoices();
    }

    // List voices from all providers
    const allVoices: TTSVoice[] = [];

    for (const provider of this.providers.values()) {
      if (provider.isConfigured()) {
        try {
          const voices = await provider.listVoices();
          allVoices.push(...voices);
        } catch (error) {
          console.warn(`Failed to list voices from ${provider.name}:`, error);
        }
      }
    }

    return allVoices;
  }

  /**
   * Get list of available (configured) providers
   */
  getAvailableProviders(): TTSProvider[] {
    const available: TTSProvider[] = [];

    for (const [name, provider] of this.providers) {
      if (provider.isConfigured()) {
        available.push(name);
      }
    }

    return available;
  }

  /**
   * Test all configured providers
   */
  async testProviders(): Promise<Map<TTSProvider, boolean>> {
    const results = new Map<TTSProvider, boolean>();

    for (const [name, provider] of this.providers) {
      const working = await provider.testConnection();
      results.set(name, working);
    }

    return results;
  }

  /**
   * Get provider by name
   */
  getProvider(name: TTSProvider): BaseTTSProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Set default provider
   */
  setDefaultProvider(provider: TTSProvider): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not configured`);
    }
    this.defaultProvider = provider;
  }

  /**
   * Get the provider order for fallback
   */
  private getProviderOrder(preferredProvider: TTSProvider): TTSProvider[] {
    const order = [preferredProvider];

    for (const provider of this.fallbackOrder) {
      if (provider !== preferredProvider) {
        order.push(provider);
      }
    }

    return order;
  }

  /**
   * Create a TTSClient from environment variables
   */
  static fromEnv(): TTSClient {
    return new TTSClient({
      providers: {
        elevenlabs: process.env.ELEVENLABS_API_KEY
          ? { apiKey: process.env.ELEVENLABS_API_KEY }
          : undefined,
        openai: process.env.OPENAI_API_KEY
          ? { apiKey: process.env.OPENAI_API_KEY }
          : undefined,
        google: process.env.GOOGLE_CLOUD_PROJECT
          ? {
              projectId: process.env.GOOGLE_CLOUD_PROJECT,
              keyFilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            }
          : undefined,
        azure:
          process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION
            ? {
                subscriptionKey: process.env.AZURE_SPEECH_KEY,
                region: process.env.AZURE_SPEECH_REGION,
              }
            : undefined,
      },
    });
  }
}
