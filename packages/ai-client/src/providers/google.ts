/**
 * @sbf/ai-client - Google Gemini Provider
 * 
 * Provider implementation for Google Gemini API.
 */

import axios from 'axios';
import {
  LlmProvider,
  ProviderInfo,
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ChatMessage,
  EmbeddingRequest,
  EmbeddingResponse,
  StreamHandler,
} from '../interfaces';

export class GoogleProvider implements LlmProvider {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  readonly providerInfo: ProviderInfo = {
    name: 'google',
    displayName: 'Google Gemini',
    supportsStreaming: true,
    supportsEmbedding: true,
    supportsTools: true,
    supportsJsonMode: true,
    isLocal: false,
    defaultModels: {
      chat: 'gemini-2.0-flash-exp',
      embedding: 'text-embedding-004',
    },
  };

  constructor(apiKey: string, config?: Partial<ProviderConfig>) {
    this.apiKey = apiKey;
    this.baseUrl = config?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    this.timeout = config?.timeout || 60000;
  }

  async generate(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const model = request.model || 'gemini-2.0-flash-exp';
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: this.formatMessages(request.messages),
        generationConfig: {
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          topP: request.topP,
          stopSequences: request.stop ? (Array.isArray(request.stop) ? request.stop : [request.stop]) : undefined,
          responseMimeType: request.responseFormat?.type === 'json_object' ? 'application/json' : undefined,
        },
        tools: request.tools ? [{
          functionDeclarations: request.tools.map(t => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          })),
        }] : undefined,
        toolConfig: request.toolChoice ? this.formatToolChoice(request.toolChoice) : undefined,
      },
      { timeout: this.timeout }
    );

    const candidate = response.data.candidates?.[0];
    const content = candidate?.content?.parts
      ?.filter((p: { text?: string }) => p.text)
      .map((p: { text: string }) => p.text)
      .join('') || '';

    const functionCalls = candidate?.content?.parts
      ?.filter((p: { functionCall?: unknown }) => p.functionCall);

    return {
      content,
      finishReason: this.mapFinishReason(candidate?.finishReason),
      toolCalls: functionCalls?.length > 0 ? functionCalls.map((p: { functionCall: { name: string; args: unknown } }) => ({
        id: `fc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'function' as const,
        function: {
          name: p.functionCall.name,
          arguments: JSON.stringify(p.functionCall.args || {}),
        },
      })) : undefined,
      usage: {
        promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  async generateStream(
    request: ChatCompletionRequest,
    onChunk: StreamHandler
  ): Promise<ChatCompletionResponse> {
    const model = request.model || 'gemini-2.0-flash-exp';
    const url = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    const response = await axios.post(
      url,
      {
        contents: this.formatMessages(request.messages),
        generationConfig: {
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          topP: request.topP,
          stopSequences: request.stop ? (Array.isArray(request.stop) ? request.stop : [request.stop]) : undefined,
        },
      },
      {
        timeout: this.timeout,
        responseType: 'stream',
      }
    );

    let fullContent = '';
    let finalResponse: ChatCompletionResponse = {
      content: '',
    };

    return new Promise((resolve, reject) => {
      let buffer = '';

      response.data.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          
          const data = trimmed.slice(5).trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            
            const text = parsed.candidates?.[0]?.content?.parts
              ?.filter((p: { text?: string }) => p.text)
              .map((p: { text: string }) => p.text)
              .join('');

            if (text) {
              fullContent += text;
              onChunk({ content: text });
            }
            
            if (parsed.candidates?.[0]?.finishReason) {
              finalResponse.finishReason = this.mapFinishReason(parsed.candidates[0].finishReason);
            }

            if (parsed.usageMetadata) {
              finalResponse.usage = {
                promptTokens: parsed.usageMetadata.promptTokenCount || 0,
                completionTokens: parsed.usageMetadata.candidatesTokenCount || 0,
                totalTokens: parsed.usageMetadata.totalTokenCount || 0,
              };
            }
          } catch {
            // Skip malformed JSON
          }
        }
      });

      response.data.on('end', () => {
        finalResponse.content = fullContent;
        resolve(finalResponse);
      });

      response.data.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const model = request.model || 'text-embedding-004';
    const inputs = Array.isArray(request.input) ? request.input : [request.input];
    
    // Google embedding API handles batching differently
    const url = `${this.baseUrl}/models/${model}:batchEmbedContents?key=${this.apiKey}`;
    
    const response = await axios.post(
      url,
      {
        requests: inputs.map(input => ({
          model: `models/${model}`,
          content: {
            parts: [{ text: input }],
          },
        })),
      },
      { timeout: this.timeout }
    );

    const embeddings = response.data.embeddings?.map(
      (e: { values: number[] }) => e.values
    ) || [];

    return {
      embeddings,
      model,
    };
  }

  async countTokens(messages: ChatMessage[]): Promise<number> {
    // Gemini token estimation
    let total = 0;
    for (const msg of messages) {
      total += Math.ceil(msg.content.length / 4);
      total += 4;
    }
    return total;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/models?key=${this.apiKey}`;
      await axios.get(url, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[]): object[] {
    const contents: object[] = [];
    let currentRole = '';
    let currentParts: object[] = [];

    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      
      // Handle system messages as user messages with different treatment
      if (msg.role === 'system') {
        contents.push({
          role: 'user',
          parts: [{ text: `System: ${msg.content}` }],
        });
        continue;
      }

      // Handle function/tool results
      if (msg.role === 'function' || msg.role === 'tool') {
        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: msg.name || 'function',
              response: { result: msg.content },
            },
          }],
        });
        continue;
      }

      // Combine consecutive messages of same role
      if (role === currentRole) {
        currentParts.push({ text: msg.content });
      } else {
        if (currentParts.length > 0) {
          contents.push({ role: currentRole, parts: currentParts });
        }
        currentRole = role;
        currentParts = [{ text: msg.content }];
      }
    }

    // Push final accumulated message
    if (currentParts.length > 0) {
      contents.push({ role: currentRole, parts: currentParts });
    }

    return contents;
  }

  private formatToolChoice(
    choice: ChatCompletionRequest['toolChoice']
  ): { functionCallingConfig: { mode: string; allowedFunctionNames?: string[] } } | undefined {
    if (!choice) return undefined;
    if (choice === 'none') return { functionCallingConfig: { mode: 'NONE' } };
    if (choice === 'auto') return { functionCallingConfig: { mode: 'AUTO' } };
    if (choice === 'required') return { functionCallingConfig: { mode: 'ANY' } };
    if (typeof choice === 'object') {
      return { 
        functionCallingConfig: { 
          mode: 'ANY',
          allowedFunctionNames: [choice.function.name],
        },
      };
    }
    return undefined;
  }

  private mapFinishReason(reason?: string): ChatCompletionResponse['finishReason'] {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
        return 'content_filter';
      default:
        return undefined;
    }
  }
}
