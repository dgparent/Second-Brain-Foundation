/**
 * Google Cloud TTS Provider
 *
 * Uses Google Cloud Text-to-Speech API.
 * Supports WaveNet and Neural2 voices with SSML.
 */
import { BaseTTSProvider } from './base';
import {
  GoogleTTSConfig,
  TTSProvider,
  TTSRequest,
  TTSResponse,
  TTSVoice,
  AudioFormat,
} from '../types';
import { estimateDuration } from '../utils/audio';

// Conditionally import to handle when module is not installed
let TextToSpeechClient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const googleTTS = require('@google-cloud/text-to-speech');
  TextToSpeechClient = googleTTS.TextToSpeechClient;
} catch {
  // Module not installed, provider won't be available
}

export class GoogleTTSProvider extends BaseTTSProvider {
  readonly name: TTSProvider = 'google';

  private client: any | null = null;
  private projectId: string;
  private configured: boolean = false;

  constructor(config: GoogleTTSConfig) {
    super();
    this.projectId = config.projectId;

    if (!TextToSpeechClient) {
      console.warn(
        'Google Cloud TTS SDK not installed. Run: npm install @google-cloud/text-to-speech'
      );
      return;
    }

    try {
      if (config.credentials) {
        this.client = new TextToSpeechClient({
          projectId: config.projectId,
          credentials: config.credentials,
        });
      } else if (config.keyFilePath) {
        this.client = new TextToSpeechClient({
          projectId: config.projectId,
          keyFilename: config.keyFilePath,
        });
      } else {
        // Use default application credentials
        this.client = new TextToSpeechClient({
          projectId: config.projectId,
        });
      }
      this.configured = true;
    } catch (error) {
      console.error('Failed to initialize Google TTS client:', error);
      this.configured = false;
    }
  }

  isConfigured(): boolean {
    return this.configured && this.client !== null;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    if (!this.isConfigured()) {
      throw new Error('Google Cloud TTS provider not configured');
    }

    // Map audio format to Google encoding
    const encodingMap: Record<AudioFormat, string> = {
      mp3: 'MP3',
      wav: 'LINEAR16',
      ogg: 'OGG_OPUS',
      opus: 'OGG_OPUS',
      pcm: 'LINEAR16',
    };

    const audioEncoding = encodingMap[request.format || 'mp3'] || 'MP3';

    // Parse voice ID (format: languageCode-voiceName, e.g., en-US-Wavenet-D)
    const [languageCode, ...voiceParts] = request.voiceId.split('-');
    const voiceName = request.voiceId;

    const speed = request.speed ?? 1.0;
    const pitch = request.pitch ?? 0;

    try {
      const [response] = await this.client.synthesizeSpeech({
        input: { text: request.text },
        voice: {
          languageCode: languageCode || 'en-US',
          name: voiceName,
        },
        audioConfig: {
          audioEncoding,
          speakingRate: speed,
          pitch,
          effectsProfileId: ['small-bluetooth-speaker-class-device'],
        },
      });

      const audioBuffer = Buffer.from(response.audioContent, 'base64');
      const duration = estimateDuration(request.text, speed);

      return {
        audio: audioBuffer,
        format: request.format || 'mp3',
        duration,
        characterCount: request.text.length,
        provider: 'google',
        voiceId: request.voiceId,
        metadata: {
          languageCode,
          audioEncoding,
        },
      };
    } catch (error: any) {
      throw new Error(`Google TTS failed: ${error.message || error}`);
    }
  }

  async listVoices(languageCode?: string): Promise<TTSVoice[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const [response] = await this.client.listVoices({
        languageCode: languageCode || 'en',
      });

      return (response.voices || []).map((voice: any) => ({
        id: voice.name,
        name: this.formatVoiceName(voice.name),
        provider: 'google' as TTSProvider,
        gender: this.mapGender(voice.ssmlGender),
        language: voice.languageCodes?.[0] || 'en',
        style: this.getVoiceType(voice.name),
        metadata: {
          naturalSampleRateHertz: voice.naturalSampleRateHertz,
          languageCodes: voice.languageCodes,
        },
      }));
    } catch (error: any) {
      throw new Error(`Failed to list Google voices: ${error.message || error}`);
    }
  }

  private formatVoiceName(name: string): string {
    // Convert en-US-Wavenet-D to "US Wavenet D"
    const parts = name.split('-');
    if (parts.length >= 3) {
      return `${parts[1]} ${parts[2]} ${parts.slice(3).join(' ')}`.trim();
    }
    return name;
  }

  private mapGender(ssmlGender: string): 'male' | 'female' | 'neutral' {
    switch (ssmlGender) {
      case 'MALE':
        return 'male';
      case 'FEMALE':
        return 'female';
      default:
        return 'neutral';
    }
  }

  private getVoiceType(name: string): string {
    if (name.includes('Neural2')) return 'Neural2 (Premium)';
    if (name.includes('Wavenet')) return 'WaveNet';
    if (name.includes('Standard')) return 'Standard';
    if (name.includes('Studio')) return 'Studio';
    return 'Standard';
  }

  getCharacterLimit(): number {
    // Google Cloud TTS has a 5000 character limit per request
    return 5000;
  }

  supportsFormat(format: string): boolean {
    return ['mp3', 'wav', 'ogg', 'opus'].includes(format);
  }
}
