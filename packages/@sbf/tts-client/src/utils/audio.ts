/**
 * Audio Utilities
 */

/**
 * Estimate audio duration based on text length and speaking rate
 * Average speaking rate is ~150 words per minute or ~2.5 words per second
 * Average word length is ~5 characters
 *
 * @param text - Text to estimate duration for
 * @param speed - Speech speed multiplier (default 1.0)
 * @returns Estimated duration in seconds
 */
export function estimateDuration(text: string, speed: number = 1.0): number {
  // Count words (split by whitespace)
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  // Average speaking rate: 150 words per minute = 2.5 words per second
  const wordsPerSecond = 2.5 * speed;

  // Calculate base duration
  const duration = words / wordsPerSecond;

  // Add small overhead for pauses between sentences
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const pauseTime = sentences * 0.3; // 300ms pause per sentence

  return Math.max(1, duration + pauseTime);
}

/**
 * Calculate text character count excluding whitespace-only strings
 */
export function countCharacters(text: string): number {
  return text.trim().length;
}

/**
 * Split text into chunks that fit within character limit
 * Tries to split at sentence boundaries
 *
 * @param text - Text to split
 * @param maxChars - Maximum characters per chunk
 * @returns Array of text chunks
 */
export function splitTextIntoChunks(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  // Split by sentences
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChars) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }

      // If single sentence is too long, split by words
      if (sentence.length > maxChars) {
        const words = sentence.split(/\s+/);
        currentChunk = '';

        for (const word of words) {
          if (currentChunk.length + word.length + 1 <= maxChars) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = word;
          }
        }
      } else {
        currentChunk = sentence;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Convert audio format (placeholder - actual implementation would use ffmpeg)
 * For now, returns the input buffer unchanged
 *
 * @param audio - Audio buffer
 * @param fromFormat - Source format
 * @param toFormat - Target format
 * @returns Converted audio buffer
 */
export async function convertAudioFormat(
  audio: Buffer,
  fromFormat: string,
  toFormat: string
): Promise<Buffer> {
  if (fromFormat === toFormat) {
    return audio;
  }

  // TODO: Implement actual conversion using ffmpeg or similar
  // For now, return original buffer with warning
  console.warn(
    `Audio format conversion from ${fromFormat} to ${toFormat} not implemented. ` +
      'Returning original audio.'
  );

  return audio;
}

/**
 * Merge multiple audio buffers into one
 * Placeholder - actual implementation would use pydub/ffmpeg
 *
 * @param audioBuffers - Array of audio buffers to merge
 * @param pauseMs - Pause duration in milliseconds between segments
 * @returns Merged audio buffer
 */
export async function mergeAudioBuffers(
  audioBuffers: Buffer[],
  pauseMs: number = 500
): Promise<Buffer> {
  if (audioBuffers.length === 0) {
    return Buffer.alloc(0);
  }

  if (audioBuffers.length === 1) {
    return audioBuffers[0];
  }

  // TODO: Implement actual merging using ffmpeg
  // For now, concatenate buffers directly (won't work correctly for most formats)
  console.warn(
    'Audio merging not properly implemented. Use Python pydub service for production.'
  );

  return Buffer.concat(audioBuffers);
}

/**
 * Calculate approximate file size for audio
 *
 * @param durationSeconds - Duration in seconds
 * @param format - Audio format
 * @param quality - Quality preset ('low', 'medium', 'high')
 * @returns Estimated file size in bytes
 */
export function estimateFileSize(
  durationSeconds: number,
  format: string = 'mp3',
  quality: 'low' | 'medium' | 'high' = 'medium'
): number {
  // Bitrates in kbps
  const bitrates: Record<string, Record<string, number>> = {
    mp3: { low: 64, medium: 128, high: 256 },
    wav: { low: 352, medium: 705, high: 1411 }, // 16-bit
    ogg: { low: 48, medium: 96, high: 192 },
    opus: { low: 24, medium: 64, high: 128 },
  };

  const formatBitrates = bitrates[format] || bitrates.mp3;
  const bitrate = formatBitrates[quality] || formatBitrates.medium;

  // Convert kbps to bytes per second, then multiply by duration
  return Math.round((bitrate * 1000 * durationSeconds) / 8);
}
