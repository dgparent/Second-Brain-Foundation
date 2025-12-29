/**
 * Base TTS Provider Interface
 */
import { TTSProvider, TTSRequest, TTSResponse, TTSVoice } from '../types';

/**
 * Abstract base class for TTS providers
 */
export abstract class BaseTTSProvider {
  /** Provider name identifier */
  abstract readonly name: TTSProvider;

  /**
   * Check if the provider is properly configured
   */
  abstract isConfigured(): boolean;

  /**
   * Synthesize text to speech
   * @param request - TTS request parameters
   * @returns Promise resolving to TTS response with audio data
   */
  abstract synthesize(request: TTSRequest): Promise<TTSResponse>;

  /**
   * List available voices from this provider
   * @returns Promise resolving to array of available voices
   */
  abstract listVoices(): Promise<TTSVoice[]>;

  /**
   * Test the provider connection
   * @returns Promise resolving to true if provider is working
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const voices = await this.listVoices();
      return voices.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get provider-specific character limit per request
   */
  getCharacterLimit(): number {
    // Default limit, override in subclasses
    return 5000;
  }

  /**
   * Check if provider supports a specific audio format
   */
  supportsFormat(format: string): boolean {
    return ['mp3', 'wav'].includes(format);
  }
}
