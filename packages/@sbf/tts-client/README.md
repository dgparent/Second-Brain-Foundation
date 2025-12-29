# @sbf/tts-client

Multi-provider Text-to-Speech client for Second Brain Foundation.

## Features

- **Multi-Provider Support**: ElevenLabs, OpenAI, Google Cloud TTS, Azure Cognitive Services
- **Automatic Fallback**: Falls back to next provider on failure
- **Long Text Handling**: Automatically splits long text and merges audio
- **Voice Mapping**: Preset voice configurations for podcast generation
- **Progress Tracking**: Callbacks for synthesis progress

## Installation

```bash
pnpm add @sbf/tts-client
```

## Usage

### Basic Usage

```typescript
import { TTSClient } from '@sbf/tts-client';

const client = new TTSClient({
  providers: {
    openai: { apiKey: process.env.OPENAI_API_KEY },
    elevenlabs: { apiKey: process.env.ELEVENLABS_API_KEY },
  },
});

// Synthesize text
const response = await client.synthesize({
  text: 'Hello, world!',
  voiceId: 'alloy',
  provider: 'openai',
});

// response.audio is a Buffer containing MP3 data
fs.writeFileSync('output.mp3', response.audio);
```

### Using Environment Variables

```typescript
import { TTSClient } from '@sbf/tts-client';

// Automatically configures providers from environment variables
const client = TTSClient.fromEnv();
```

Environment variables:
- `OPENAI_API_KEY` - OpenAI API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `GOOGLE_CLOUD_PROJECT` - Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google credentials
- `AZURE_SPEECH_KEY` - Azure subscription key
- `AZURE_SPEECH_REGION` - Azure region (e.g., 'eastus')

### Listing Voices

```typescript
// List all voices
const voices = await client.listVoices();

// List voices from specific provider
const openaiVoices = await client.listVoices('openai');
```

### Synthesizing Multiple Segments

```typescript
const segments = [
  { text: 'Welcome to the show!', voiceId: 'alloy' },
  { text: 'Thanks for having me.', voiceId: 'nova' },
];

const results = await client.synthesizeSegments(segments, (event) => {
  if (event.type === 'progress') {
    console.log(`Segment ${event.segmentIndex + 1}/${event.totalSegments}`);
  }
});
```

### Voice Presets

```typescript
import { getDefaultVoices, getRecommendedVoicePairs } from '@sbf/tts-client';

// Get default host/guest voices
const defaults = getDefaultVoices();
console.log(defaults.host); // { id: 'alloy', name: 'Alloy', ... }

// Get recommended pairs for different styles
const pairs = getRecommendedVoicePairs();
// [{ style: 'professional', host: {...}, guest: {...} }, ...]
```

## Providers

### OpenAI TTS

Fixed set of voices: alloy, echo, fable, onyx, nova, shimmer.

```typescript
const client = new TTSClient({
  providers: {
    openai: {
      apiKey: 'sk-...',
      model: 'tts-1-hd', // or 'tts-1' for faster
    },
  },
});
```

### ElevenLabs

Premium quality voices with multilingual support.

```typescript
const client = new TTSClient({
  providers: {
    elevenlabs: {
      apiKey: 'el-...',
      modelId: 'eleven_multilingual_v2',
      stability: 0.5,
      similarityBoost: 0.75,
    },
  },
});
```

### Google Cloud TTS

WaveNet and Neural2 voices.

```typescript
const client = new TTSClient({
  providers: {
    google: {
      projectId: 'my-project',
      keyFilePath: '/path/to/credentials.json',
    },
  },
});
```

### Azure Cognitive Services

Neural voices with SSML support.

```typescript
const client = new TTSClient({
  providers: {
    azure: {
      subscriptionKey: '...',
      region: 'eastus',
    },
  },
});
```

## API Reference

### TTSClient

#### Constructor Options

```typescript
interface TTSClientOptions {
  providers: TTSProviderConfig;
  defaultProvider?: TTSProvider;
  enableFallback?: boolean; // Default: true
  fallbackOrder?: TTSProvider[];
}
```

#### Methods

- `synthesize(request: TTSRequest): Promise<TTSResponse>`
- `synthesizeSegments(segments, callback?): Promise<TTSResponse[]>`
- `listVoices(provider?): Promise<TTSVoice[]>`
- `getAvailableProviders(): TTSProvider[]`
- `testProviders(): Promise<Map<TTSProvider, boolean>>`
- `setDefaultProvider(provider: TTSProvider): void`

### TTSRequest

```typescript
interface TTSRequest {
  text: string;
  voiceId: string;
  provider?: TTSProvider;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // -20 to 20
  format?: 'mp3' | 'wav' | 'ogg' | 'opus';
}
```

### TTSResponse

```typescript
interface TTSResponse {
  audio: Buffer;
  format: AudioFormat;
  duration: number; // seconds
  characterCount: number;
  provider: TTSProvider;
  voiceId: string;
}
```

## Audio Utilities

```typescript
import { 
  estimateDuration, 
  splitTextIntoChunks, 
  estimateFileSize 
} from '@sbf/tts-client';

// Estimate audio duration
const duration = estimateDuration(text, speed);

// Split long text into chunks
const chunks = splitTextIntoChunks(text, 5000);

// Estimate file size
const bytes = estimateFileSize(60, 'mp3', 'high');
```

## Character Limits

| Provider | Limit |
|----------|-------|
| OpenAI | 4,096 |
| ElevenLabs | 5,000 |
| Google | 5,000 |
| Azure | 10,000 |

The client automatically handles text longer than the limit by splitting into chunks.

## Error Handling

```typescript
try {
  const response = await client.synthesize({
    text: 'Hello',
    voiceId: 'invalid-voice',
  });
} catch (error) {
  if (error.message.includes('Invalid voice')) {
    // Handle invalid voice
  }
}
```

## Testing

```bash
pnpm test --filter @sbf/tts-client
```

## License

MIT
