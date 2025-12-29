/**
 * Transformation service for executing transformations.
 * 
 * Orchestrates template rendering, LLM calls, and output parsing.
 */

// Type definitions - these would normally come from @sbf/ai-client
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  choices: Array<{
    message: {
      content?: string;
      role?: string;
    };
  }>;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export interface ModelClient {
  chat(request: ChatRequest): Promise<ChatResponse>;
}

// Type definitions - these would normally come from @sbf/job-runner
export interface Job {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  payload: unknown;
}

export interface JobEnqueueOptions {
  priority?: 'low' | 'normal' | 'high';
  retries?: number;
  timeout?: number;
}

export interface JobRunner {
  enqueue(type: string, payload: unknown, options?: JobEnqueueOptions): Promise<Job>;
}

import { 
  TransformationContext, 
  ExecutionOptions, 
  TransformationJobPayload,
  OutputFormat 
} from '../types';
import { 
  Transformation, 
  TransformationRepository 
} from '../models/Transformation';
import { 
  TransformationResult, 
  TransformationResultRepository,
  createTransformationResult 
} from '../models/TransformationResult';
import { 
  TransformationConfig, 
  TransformationConfigRepository,
  DEFAULT_TRANSFORMATION_CONFIG 
} from '../models/TransformationConfig';
import { TemplateRenderer, createTemplateRenderer } from './TemplateRenderer';
import { OutputParser, createOutputParser } from './OutputParser';

/**
 * Transformation execution result.
 */
export interface ExecutionResult {
  /** The transformation result record */
  result: TransformationResult;
  
  /** Parsed output data (for JSON/structured) */
  parsed?: unknown;
  
  /** Whether execution was successful */
  success: boolean;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Transformation service configuration.
 */
export interface TransformationServiceConfig {
  /** Model client for LLM calls */
  modelClient: ModelClient;
  
  /** Job runner for async execution */
  jobRunner?: JobRunner;
  
  /** Transformation repository */
  transformationRepo: TransformationRepository;
  
  /** Result repository */
  resultRepo: TransformationResultRepository;
  
  /** Config repository */
  configRepo?: TransformationConfigRepository;
  
  /** Default model to use */
  defaultModel?: string;
  
  /** Enable caching */
  enableCache?: boolean;
}

/**
 * Transformation service.
 */
export class TransformationService {
  private modelClient: ModelClient;
  private jobRunner?: JobRunner;
  private transformationRepo: TransformationRepository;
  private resultRepo: TransformationResultRepository;
  private configRepo?: TransformationConfigRepository;
  private templateRenderer: TemplateRenderer;
  private outputParser: OutputParser;
  private defaultModel: string;
  private enableCache: boolean;
  
  constructor(config: TransformationServiceConfig) {
    this.modelClient = config.modelClient;
    this.jobRunner = config.jobRunner;
    this.transformationRepo = config.transformationRepo;
    this.resultRepo = config.resultRepo;
    this.configRepo = config.configRepo;
    this.defaultModel = config.defaultModel ?? 'gpt-4o-mini';
    this.enableCache = config.enableCache ?? true;
    
    this.templateRenderer = createTemplateRenderer();
    this.outputParser = createOutputParser();
  }
  
  /**
   * Execute a transformation synchronously.
   */
  async execute(
    transformationId: string,
    context: TransformationContext,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    // Get transformation
    const transformation = await this.transformationRepo.get(transformationId);
    if (!transformation) {
      throw new Error(`Transformation not found: ${transformationId}`);
    }
    
    // Check tenant config for limits
    if (context.tenantId && this.configRepo) {
      await this.checkTenantLimits(context.tenantId);
    }
    
    try {
      // Render prompt template
      const rendered = this.templateRenderer.render(
        transformation.promptTemplate,
        context
      );
      
      // Build chat request
      const model = options.modelOverride ?? transformation.modelId ?? this.defaultModel;
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(transformation.outputFormat),
        },
        {
          role: 'user',
          content: rendered.content,
        },
      ];
      
      const request: ChatRequest = {
        model,
        messages,
        temperature: transformation.temperature ?? 0.7,
        maxTokens: transformation.maxTokens ?? 2000,
      };
      
      // Call LLM
      const response = await this.modelClient.chat(request);
      
      // Parse output
      const outputContent = response.choices[0]?.message?.content ?? '';
      const parseResult = this.outputParser.parse(
        outputContent,
        transformation.outputFormat,
        transformation.outputSchema
      );
      
      // Calculate metrics
      const duration = Date.now() - startTime;
      const inputTokens = response.usage?.promptTokens ?? rendered.estimatedTokens;
      const outputTokens = response.usage?.completionTokens ?? Math.ceil(outputContent.length / 4);
      const cost = this.estimateCost(model, inputTokens, outputTokens);
      
      // Create result record
      const result = createTransformationResult({
        tenantId: context.tenantId ?? '',
        transformationId,
        sourceId: context.source?.id,
        sourceVersion: context.source?.version,
        output: parseResult.content,
        outputFormat: transformation.outputFormat,
        inputTokens,
        outputTokens,
        cost,
        durationMs: duration,
        modelUsed: model,
        transformationVersion: transformation.version,
      });
      
      // Persist result
      const savedResult = await this.resultRepo.create(result);
      
      return {
        result: savedResult,
        parsed: parseResult.parsed,
        success: parseResult.valid,
        error: parseResult.errors?.join('; '),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Create error result
      const result = createTransformationResult({
        tenantId: context.tenantId ?? '',
        transformationId,
        sourceId: context.source?.id,
        sourceVersion: context.source?.version,
        output: '',
        outputFormat: transformation.outputFormat,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        durationMs: duration,
        modelUsed: options.modelOverride ?? transformation.modelId ?? this.defaultModel,
        transformationVersion: transformation.version,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      const savedResult = await this.resultRepo.create(result);
      
      return {
        result: savedResult,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Execute transformation asynchronously via job queue.
   */
  async executeAsync(
    transformationId: string,
    context: TransformationContext,
    options: ExecutionOptions = {}
  ): Promise<Job> {
    if (!this.jobRunner) {
      throw new Error('Job runner not configured for async execution');
    }
    
    const payload: TransformationJobPayload = {
      transformationId,
      context,
      options,
    };
    
    return this.jobRunner.enqueue('transformation', payload, {
      priority: options.priority ?? 'normal',
      retries: 3,
      timeout: 120000, // 2 minute timeout
    });
  }
  
  /**
   * Get available transformations for a tenant.
   */
  async getAvailableTransformations(
    tenantId: string,
    ingestionType?: string
  ): Promise<Transformation[]> {
    // Get all transformations available to tenant (system defaults + tenant-specific)
    const allTransformations = await this.transformationRepo.getForTenant(tenantId);
    
    // Create a map to handle duplicates (prefer tenant-specific over system defaults)
    const byName = new Map<string, Transformation>();
    
    // First add system defaults
    for (const t of allTransformations) {
      if (t.tenantId === null) {
        byName.set(t.name, t);
      }
    }
    
    // Then override with tenant-specific (they take precedence)
    for (const t of allTransformations) {
      if (t.tenantId === tenantId) {
        byName.set(t.name, t);
      }
    }
    
    // Convert back to array and filter
    return Array.from(byName.values()).filter(t => {
      if (t.isEnabled === false) return false;
      if (ingestionType && t.applicableIngestionTypes && t.applicableIngestionTypes.length > 0) {
        return t.applicableIngestionTypes.includes(ingestionType);
      }
      return true;
    });
  }
  
  /**
   * Execute multiple transformations for a source.
   */
  async executeMultiple(
    transformationIds: string[],
    context: TransformationContext,
    options: ExecutionOptions & { parallel?: boolean } = {}
  ): Promise<ExecutionResult[]> {
    if (options.parallel !== false) {
      // Execute in parallel
      return Promise.all(
        transformationIds.map(id => this.execute(id, context, options))
      );
    }
    
    // Execute sequentially
    const results: ExecutionResult[] = [];
    for (const id of transformationIds) {
      results.push(await this.execute(id, context, options));
    }
    return results;
  }
  
  /**
   * Get transformation results for a source.
   */
  async getResultsForSource(
    sourceId: string,
    tenantId: string
  ): Promise<TransformationResult[]> {
    const all = await this.resultRepo.getBySource(sourceId);
    return all.filter(r => r.tenantId === tenantId);
  }
  
  /**
   * Get latest result for a transformation/source combo.
   */
  async getLatestResult(
    transformationId: string,
    sourceId: string,
    tenantId: string
  ): Promise<TransformationResult | null> {
    const results = await this.resultRepo.getByTransformation(transformationId);
    
    return results
      .filter(r => r.sourceId === sourceId && r.tenantId === tenantId)
      .sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )[0] ?? null;
  }
  
  /**
   * Preview transformation output (dry run).
   */
  async preview(
    transformationId: string,
    context: TransformationContext
  ): Promise<{ prompt: string; estimatedTokens: number }> {
    const transformation = await this.transformationRepo.get(transformationId);
    if (!transformation) {
      throw new Error(`Transformation not found: ${transformationId}`);
    }
    
    const rendered = this.templateRenderer.render(
      transformation.promptTemplate,
      context
    );
    
    return {
      prompt: rendered.content,
      estimatedTokens: rendered.estimatedTokens,
    };
  }
  
  /**
   * Validate a transformation template.
   */
  validateTemplate(template: string): { valid: boolean; error?: string; variables?: string[] } {
    const validation = this.templateRenderer.validate(template);
    
    if (!validation.valid) {
      return validation;
    }
    
    const variables = this.templateRenderer.extractVariables(template);
    
    return {
      valid: true,
      variables,
    };
  }
  
  /**
   * Get system prompt for output format.
   */
  private getSystemPrompt(format: OutputFormat): string {
    switch (format) {
      case 'json':
        return `You are a precise AI assistant. Always respond with valid JSON only. No additional text or explanation outside the JSON structure.`;
      case 'structured':
        return `You are a precise AI assistant. Follow the output schema exactly. Respond with valid JSON matching the required structure.`;
      case 'markdown':
      default:
        return `You are a helpful AI assistant. Provide clear, well-formatted responses using Markdown.`;
    }
  }
  
  /**
   * Estimate cost based on model and tokens.
   */
  private estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Rough cost estimates per 1K tokens
    const costs: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 0.0025, output: 0.01 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    };
    
    const modelCosts = costs[model] ?? costs['gpt-4o-mini'];
    
    return (inputTokens / 1000 * modelCosts.input) + 
           (outputTokens / 1000 * modelCosts.output);
  }
  
  /**
   * Check tenant limits before execution.
   */
  private async checkTenantLimits(tenantId: string): Promise<void> {
    if (!this.configRepo) return;
    
    const config = await this.configRepo.get(tenantId) ?? 
      DEFAULT_TRANSFORMATION_CONFIG;
    
    // Get today's results (approximation - ideally would query by date)
    const today = new Date().toISOString().split('T')[0];
    
    // Check if dailyUsed is set on config
    if (config.dailyUsed !== undefined && config.dailyUsed >= (config.dailyLimit ?? 1000)) {
      throw new Error(`Daily transformation limit (${config.dailyLimit}) reached`);
    }
  }
}

/**
 * Create transformation service with default configuration.
 */
export function createTransformationService(
  config: TransformationServiceConfig
): TransformationService {
  return new TransformationService(config);
}
