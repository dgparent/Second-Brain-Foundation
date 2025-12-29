/**
 * BMOMExtractor Service
 * 
 * Extracts BMOM (Because, Meaning, Outcome, Measure) framework from entity content.
 * Implements PRD FR18-19 requirements.
 */

import type { BMOMData } from '../types';

export interface AIClient {
  generate(options: {
    prompt: string;
    modelType?: string;
    maxTokens?: number;
  }): Promise<{ content: string }>;
}

const BMOM_PROMPT = `
Analyze the following content and extract the BMOM framework components:

CONTENT:
{content}

Extract and return JSON with these fields:
{
  "because": "Why this content matters - the motivation or trigger",
  "meaning": "What this means in the broader context",
  "outcome": "Expected results, implications, or next steps",
  "measure": "How to measure success or validate this"
}

Each field should be 1-3 sentences. Be concise but meaningful.
Return ONLY valid JSON, no markdown formatting or extra text.
`;

export interface BMOMExtractorConfig {
  minContentLength?: number;  // Minimum content length for extraction
  maxContentLength?: number;  // Maximum content to analyze
  confidenceThreshold?: number;  // Minimum confidence for valid BMOM
}

export class BMOMExtractor {
  private config: BMOMExtractorConfig;
  
  constructor(
    private aiClient: AIClient,
    config: BMOMExtractorConfig = {}
  ) {
    this.config = {
      minContentLength: config.minContentLength ?? 100,
      maxContentLength: config.maxContentLength ?? 5000,
      confidenceThreshold: config.confidenceThreshold ?? 0.5,
    };
  }
  
  /**
   * Extract BMOM from content
   */
  async extract(content: string): Promise<BMOMData | null> {
    if (!content || content.length < this.config.minContentLength!) {
      return null; // Too short for meaningful BMOM
    }
    
    try {
      // Truncate content if too long
      const truncatedContent = content.substring(0, this.config.maxContentLength);
      
      const response = await this.aiClient.generate({
        prompt: BMOM_PROMPT.replace('{content}', truncatedContent),
        modelType: 'transformation',
        maxTokens: 500,
      });
      
      // Parse JSON response
      const parsed = this.parseResponse(response.content);
      if (!parsed) {
        return null;
      }
      
      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(parsed);
      
      if (confidence < this.config.confidenceThreshold!) {
        return null;
      }
      
      return {
        because: parsed.because || '',
        meaning: parsed.meaning || '',
        outcome: parsed.outcome || '',
        measure: parsed.measure || '',
        confidence,
        extractedAt: new Date(),
      };
    } catch (error) {
      console.error('BMOM extraction failed:', error);
      return null;
    }
  }
  
  /**
   * Extract BMOM with metadata about the extraction
   */
  async extractWithMetadata(content: string): Promise<{
    bmom: BMOMData | null;
    metadata: {
      contentLength: number;
      truncated: boolean;
      extractionTime: number;
    };
  }> {
    const startTime = Date.now();
    const truncated = content.length > this.config.maxContentLength!;
    
    const bmom = await this.extract(content);
    
    return {
      bmom,
      metadata: {
        contentLength: content.length,
        truncated,
        extractionTime: Date.now() - startTime,
      },
    };
  }
  
  /**
   * Parse AI response into BMOM structure
   */
  private parseResponse(response: string): Partial<BMOMData> | null {
    try {
      // Try to extract JSON from response (handling markdown code blocks)
      let jsonStr = response;
      
      // Remove markdown code blocks if present
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      // Clean up any leading/trailing whitespace
      jsonStr = jsonStr.trim();
      
      return JSON.parse(jsonStr);
    } catch {
      // Try to find JSON object in response
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        try {
          return JSON.parse(response.substring(jsonStart, jsonEnd + 1));
        } catch {
          return null;
        }
      }
      
      return null;
    }
  }
  
  /**
   * Calculate confidence score for BMOM extraction
   */
  private calculateConfidence(bmom: Partial<BMOMData>): number {
    let score = 0;
    let checks = 0;
    
    // Check each field has meaningful content
    const fields: (keyof BMOMData)[] = ['because', 'meaning', 'outcome', 'measure'];
    
    for (const field of fields) {
      checks++;
      const value = bmom[field];
      
      if (typeof value === 'string' && value.length > 20) {
        score++;
        
        // Bonus for longer, more detailed content
        if (value.length > 50) {
          score += 0.25;
        }
      }
    }
    
    return Math.min(1, score / checks);
  }
  
  /**
   * Validate BMOM data structure
   */
  validateBMOM(bmom: unknown): bmom is BMOMData {
    if (!bmom || typeof bmom !== 'object') {
      return false;
    }
    
    const data = bmom as Record<string, unknown>;
    
    return (
      typeof data.because === 'string' &&
      typeof data.meaning === 'string' &&
      typeof data.outcome === 'string' &&
      typeof data.measure === 'string' &&
      typeof data.confidence === 'number' &&
      data.extractedAt instanceof Date
    );
  }
  
  /**
   * Merge two BMOM extractions (prefer higher confidence)
   */
  mergeBMOM(existing: BMOMData | undefined, incoming: BMOMData): BMOMData {
    if (!existing) {
      return incoming;
    }
    
    if (incoming.confidence > existing.confidence) {
      return incoming;
    }
    
    return existing;
  }
  
  /**
   * Format BMOM for display
   */
  formatBMOM(bmom: BMOMData): string {
    return [
      `**Because:** ${bmom.because}`,
      `**Meaning:** ${bmom.meaning}`,
      `**Outcome:** ${bmom.outcome}`,
      `**Measure:** ${bmom.measure}`,
    ].join('\n\n');
  }
  
  /**
   * Convert BMOM to summary text
   */
  toSummary(bmom: BMOMData): string {
    const parts: string[] = [];
    
    if (bmom.because) {
      parts.push(`This matters because ${bmom.because.toLowerCase()}`);
    }
    
    if (bmom.meaning) {
      parts.push(`It means ${bmom.meaning.toLowerCase()}`);
    }
    
    if (bmom.outcome) {
      parts.push(`Expected outcome: ${bmom.outcome}`);
    }
    
    return parts.join('. ');
  }
}
