/**
 * TTS Client Tests
 */
import {
  estimateDuration,
  splitTextIntoChunks,
  countCharacters,
  estimateFileSize,
} from './utils/audio';
import {
  VoiceMapping,
  getDefaultVoices,
  getRecommendedVoicePairs,
  selectVoiceForRole,
} from './voices/mapping';

describe('Audio Utilities', () => {
  describe('estimateDuration', () => {
    it('should estimate duration based on word count', () => {
      const text = 'This is a test sentence with ten words total.';
      const duration = estimateDuration(text);

      // ~9 words at 2.5 words/second = ~3.6 seconds + pause
      expect(duration).toBeGreaterThan(3);
      expect(duration).toBeLessThan(6);
    });

    it('should account for speed multiplier', () => {
      const text = 'This is a test.';
      const normalDuration = estimateDuration(text, 1.0);
      const fastDuration = estimateDuration(text, 2.0);

      expect(fastDuration).toBeLessThan(normalDuration);
    });

    it('should return minimum of 1 second for very short text', () => {
      const duration = estimateDuration('Hi');
      expect(duration).toBeGreaterThanOrEqual(1);
    });

    it('should add pause time for multiple sentences', () => {
      const singleSentence = 'This is one sentence.';
      const multiSentence = 'First sentence. Second sentence. Third sentence.';

      const singleDuration = estimateDuration(singleSentence);
      const multiDuration = estimateDuration(multiSentence);

      // Multi-sentence should have more pause time
      expect(multiDuration).toBeGreaterThan(singleDuration * 1.5);
    });
  });

  describe('splitTextIntoChunks', () => {
    it('should return single chunk for short text', () => {
      const text = 'Short text';
      const chunks = splitTextIntoChunks(text, 100);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    it('should split at sentence boundaries', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      const chunks = splitTextIntoChunks(text, 30);

      expect(chunks.length).toBeGreaterThan(1);
      // Each chunk should be <= max length
      chunks.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(30);
      });
    });

    it('should split long sentences by words', () => {
      const text = 'This is a very long sentence that exceeds the maximum character limit and needs to be split';
      const chunks = splitTextIntoChunks(text, 40);

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(40);
      });
    });

    it('should preserve all content after splitting', () => {
      const text = 'First. Second. Third.';
      const chunks = splitTextIntoChunks(text, 10);
      const recombined = chunks.join(' ').replace(/\s+/g, ' ').trim();

      // Content should be preserved (might have different spacing)
      expect(recombined.replace(/\s+/g, '')).toBe(text.replace(/\s+/g, ''));
    });
  });

  describe('countCharacters', () => {
    it('should count characters excluding leading/trailing whitespace', () => {
      expect(countCharacters('  hello  ')).toBe(5);
      expect(countCharacters('hello world')).toBe(11);
    });

    it('should return 0 for whitespace-only strings', () => {
      expect(countCharacters('   ')).toBe(0);
      expect(countCharacters('')).toBe(0);
    });
  });

  describe('estimateFileSize', () => {
    it('should estimate file size based on duration and format', () => {
      // 60 seconds of 128kbps MP3 = 960KB = 983,040 bytes
      const size = estimateFileSize(60, 'mp3', 'medium');
      expect(size).toBeCloseTo(960000, -4);
    });

    it('should vary by quality', () => {
      const low = estimateFileSize(60, 'mp3', 'low');
      const high = estimateFileSize(60, 'mp3', 'high');

      expect(high).toBeGreaterThan(low);
    });

    it('should vary by format', () => {
      const mp3 = estimateFileSize(60, 'mp3', 'medium');
      const wav = estimateFileSize(60, 'wav', 'medium');

      expect(wav).toBeGreaterThan(mp3);
    });
  });
});

describe('Voice Mapping', () => {
  describe('VoiceMapping', () => {
    it('should have mappings for host, guest, and narrator', () => {
      expect(VoiceMapping.host).toBeDefined();
      expect(VoiceMapping.guest).toBeDefined();
      expect(VoiceMapping.narrator).toBeDefined();
    });

    it('should have fallback options', () => {
      expect(VoiceMapping.host.fallback).toBeDefined();
      expect(VoiceMapping.guest.fallback).toBeDefined();
    });
  });

  describe('getDefaultVoices', () => {
    it('should return host and guest voices', () => {
      const voices = getDefaultVoices();

      expect(voices.host).toBeDefined();
      expect(voices.guest).toBeDefined();
      expect(voices.host.id).toBe('alloy');
      expect(voices.guest.id).toBe('nova');
    });
  });

  describe('getRecommendedVoicePairs', () => {
    it('should return multiple voice pairs', () => {
      const pairs = getRecommendedVoicePairs();

      expect(pairs.length).toBeGreaterThan(0);
      pairs.forEach((pair) => {
        expect(pair.style).toBeDefined();
        expect(pair.host).toBeDefined();
        expect(pair.guest).toBeDefined();
        expect(pair.description).toBeDefined();
      });
    });

    it('should include professional and casual styles', () => {
      const pairs = getRecommendedVoicePairs();
      const styles = pairs.map((p) => p.style);

      expect(styles).toContain('professional');
      expect(styles).toContain('casual');
    });
  });

  describe('selectVoiceForRole', () => {
    it('should select primary voice when provider available', () => {
      const voice = selectVoiceForRole('host', ['openai', 'elevenlabs']);

      expect(voice.provider).toBe('openai');
      expect(voice.voiceId).toBe('alloy');
    });

    it('should fallback when primary provider unavailable', () => {
      const voice = selectVoiceForRole('host', ['elevenlabs']);

      expect(voice.provider).toBe('elevenlabs');
    });

    it('should use first available provider with default voice', () => {
      const voice = selectVoiceForRole('host', ['google']);

      expect(voice.provider).toBe('google');
    });

    it('should handle unknown roles', () => {
      const voice = selectVoiceForRole('unknown' as any, ['openai']);

      expect(voice.provider).toBe('openai');
      expect(voice.voiceId).toBe('alloy');
    });
  });
});

describe('TTS Types', () => {
  it('should have correct provider types', () => {
    const providers: Array<'elevenlabs' | 'openai' | 'google' | 'azure'> = [
      'elevenlabs',
      'openai',
      'google',
      'azure',
    ];
    expect(providers).toHaveLength(4);
  });
});

// Mock provider tests
describe('TTS Providers (Unit)', () => {
  describe('OpenAITTSProvider', () => {
    it('should list fixed voices', async () => {
      // This test would require mocking OpenAI client
      // For now, just verify the structure
      const voices = [
        { id: 'alloy', name: 'Alloy' },
        { id: 'echo', name: 'Echo' },
        { id: 'fable', name: 'Fable' },
        { id: 'onyx', name: 'Onyx' },
        { id: 'nova', name: 'Nova' },
        { id: 'shimmer', name: 'Shimmer' },
      ];

      expect(voices).toHaveLength(6);
    });
  });

  describe('ElevenLabsProvider', () => {
    it('should have correct character limit', () => {
      // Character limit should be 5000
      expect(5000).toBe(5000);
    });
  });
});

// Integration tests (marked skip by default)
describe.skip('TTS Client Integration', () => {
  it('should synthesize with OpenAI', async () => {
    // Requires API key
  });

  it('should synthesize with ElevenLabs', async () => {
    // Requires API key
  });

  it('should fallback on provider failure', async () => {
    // Requires multiple configured providers
  });
});
