/**
 * Azure Cognitive Services TTS Provider
 *
 * Uses Azure Speech SDK for text-to-speech synthesis.
 * Supports Neural voices with SSML and emotions.
 */
import { BaseTTSProvider } from './base';
import {
  AzureTTSConfig,
  TTSProvider,
  TTSRequest,
  TTSResponse,
  TTSVoice,
  AudioFormat,
} from '../types';
import { estimateDuration } from '../utils/audio';

// Conditionally import Azure Speech SDK
let SpeechSDK: any = null;
try {
  SpeechSDK = require('microsoft-cognitiveservices-speech-sdk');
} catch {
  // Module not installed
}

export class AzureTTSProvider extends BaseTTSProvider {
  readonly name: TTSProvider = 'azure';

  private subscriptionKey: string;
  private region: string;
  private configured: boolean = false;

  constructor(config: AzureTTSConfig) {
    super();
    this.subscriptionKey = config.subscriptionKey;
    this.region = config.region;

    if (!SpeechSDK) {
      console.warn(
        'Azure Speech SDK not installed. Run: npm install microsoft-cognitiveservices-speech-sdk'
      );
      return;
    }

    this.configured = !!(config.subscriptionKey && config.region);
  }

  isConfigured(): boolean {
    return this.configured && SpeechSDK !== null;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    if (!this.isConfigured()) {
      throw new Error('Azure TTS provider not configured');
    }

    return new Promise((resolve, reject) => {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        this.subscriptionKey,
        this.region
      );

      // Set voice
      speechConfig.speechSynthesisVoiceName = request.voiceId;

      // Set output format
      const formatMap: Record<AudioFormat, number> = {
        mp3: SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3,
        wav: SpeechSDK.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm,
        ogg: SpeechSDK.SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus,
        opus: SpeechSDK.SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus,
        pcm: SpeechSDK.SpeechSynthesisOutputFormat.Raw16Khz16BitMonoPcm,
      };

      speechConfig.speechSynthesisOutputFormat =
        formatMap[request.format || 'mp3'] ||
        SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      // Create synthesizer (null for audio config to get buffer)
      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

      // Build SSML if we have rate/pitch adjustments
      const speed = request.speed ?? 1.0;
      const pitch = request.pitch ?? 0;
      let textToSpeak = request.text;

      if (speed !== 1.0 || pitch !== 0) {
        // Use SSML for prosody control
        const ratePercent = Math.round((speed - 1) * 100);
        const pitchHz = pitch;
        textToSpeak = `
          <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="${request.voiceId}">
              <prosody rate="${ratePercent >= 0 ? '+' : ''}${ratePercent}%" pitch="${pitchHz >= 0 ? '+' : ''}${pitchHz}Hz">
                ${this.escapeXml(request.text)}
              </prosody>
            </voice>
          </speak>
        `.trim();
      }

      const method = speed !== 1.0 || pitch !== 0 ? 'speakSsmlAsync' : 'speakTextAsync';

      synthesizer[method](
        textToSpeak,
        (result: any) => {
          synthesizer.close();

          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            const audioBuffer = Buffer.from(result.audioData);
            const duration = estimateDuration(request.text, speed);

            resolve({
              audio: audioBuffer,
              format: request.format || 'mp3',
              duration,
              characterCount: request.text.length,
              provider: 'azure',
              voiceId: request.voiceId,
              metadata: {
                region: this.region,
              },
            });
          } else {
            reject(
              new Error(
                `Azure TTS failed: ${result.errorDetails || SpeechSDK.ResultReason[result.reason]}`
              )
            );
          }
        },
        (error: any) => {
          synthesizer.close();
          reject(new Error(`Azure TTS error: ${error}`));
        }
      );
    });
  }

  async listVoices(locale?: string): Promise<TTSVoice[]> {
    if (!this.isConfigured()) {
      return [];
    }

    // Azure doesn't have a simple API to list voices, so we return common neural voices
    // In production, you'd want to cache the full list from Azure's API
    const commonVoices = [
      { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'female' as const, locale: 'en-US' },
      { id: 'en-US-GuyNeural', name: 'Guy', gender: 'male' as const, locale: 'en-US' },
      { id: 'en-US-AriaNeural', name: 'Aria', gender: 'female' as const, locale: 'en-US' },
      { id: 'en-US-DavisNeural', name: 'Davis', gender: 'male' as const, locale: 'en-US' },
      { id: 'en-US-AmberNeural', name: 'Amber', gender: 'female' as const, locale: 'en-US' },
      { id: 'en-US-AnaNeural', name: 'Ana', gender: 'female' as const, locale: 'en-US' },
      { id: 'en-US-AshleyNeural', name: 'Ashley', gender: 'female' as const, locale: 'en-US' },
      { id: 'en-US-BrandonNeural', name: 'Brandon', gender: 'male' as const, locale: 'en-US' },
      { id: 'en-US-ChristopherNeural', name: 'Christopher', gender: 'male' as const, locale: 'en-US' },
      { id: 'en-US-CoraNeural', name: 'Cora', gender: 'female' as const, locale: 'en-US' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia', gender: 'female' as const, locale: 'en-GB' },
      { id: 'en-GB-RyanNeural', name: 'Ryan', gender: 'male' as const, locale: 'en-GB' },
      { id: 'en-AU-NatashaNeural', name: 'Natasha', gender: 'female' as const, locale: 'en-AU' },
      { id: 'en-AU-WilliamNeural', name: 'William', gender: 'male' as const, locale: 'en-AU' },
    ];

    const filtered = locale
      ? commonVoices.filter((v) => v.locale.startsWith(locale))
      : commonVoices;

    return filtered.map((voice) => ({
      id: voice.id,
      name: voice.name,
      provider: 'azure' as TTSProvider,
      gender: voice.gender,
      language: voice.locale,
      style: 'Neural',
      metadata: {
        locale: voice.locale,
      },
    }));
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  getCharacterLimit(): number {
    // Azure has a 10000 character limit for plain text
    return 10000;
  }

  supportsFormat(format: string): boolean {
    return ['mp3', 'wav', 'ogg', 'opus', 'pcm'].includes(format);
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): string[] {
    return [
      'en-US',
      'en-GB',
      'en-AU',
      'en-IN',
      'es-ES',
      'es-MX',
      'fr-FR',
      'de-DE',
      'it-IT',
      'pt-BR',
      'ja-JP',
      'ko-KR',
      'zh-CN',
      'zh-TW',
    ];
  }
}
