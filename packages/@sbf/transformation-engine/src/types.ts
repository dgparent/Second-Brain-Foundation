/**
 * Core types for the transformation engine.
 */

/**
 * Output format for transformation results.
 */
export type OutputFormat = 'markdown' | 'json' | 'structured';

/**
 * Context passed to template rendering.
 */
export interface TransformationContext {
  /** Source content being transformed */
  source?: SourceContext;
  
  /** Tenant ID for multi-tenant context */
  tenantId?: string;
  
  /** Notebook context (optional) */
  notebook?: NotebookContext;
  
  /** Custom configuration */
  config?: TransformationContextConfig;
  
  /** Allow arbitrary additional context */
  [key: string]: unknown;
}

/**
 * Source content context.
 */
export interface SourceContext {
  /** Source ID */
  id?: string;
  
  /** Source title */
  title?: string;
  
  /** Source URL (if web-based) */
  url?: string;
  
  /** Main content (may be truncated) */
  content: string;
  
  /** Full text (if available) */
  fullText?: string;
  
  /** Source type (web, pdf, youtube, etc.) */
  type?: string;
  
  /** Extracted topics */
  topics?: string[];
  
  /** Source type (web, pdf, youtube, etc.) - alias */
  sourceType?: string;
  
  /** Author or creator */
  author?: string;
  
  /** Publication date */
  publishedAt?: string;
  
  /** Source version */
  version?: number;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Notebook context.
 */
export interface NotebookContext {
  /** Notebook ID */
  id?: string;
  
  /** Notebook name */
  name: string;
  
  /** Notebook description */
  description?: string;
  
  /** Related sources count */
  sourceCount?: number;
}

/**
 * Configuration passed to transformation.
 */
export interface TransformationContextConfig {
  /** Maximum output length */
  maxLength?: number;
  
  /** Output language */
  language?: string;
  
  /** Output style (formal, casual, etc.) */
  style?: string;
  
  /** Number of items (for lists like flashcards) */
  itemCount?: number;
  
  /** Difficulty level */
  difficulty?: 'easy' | 'medium' | 'hard';
  
  /** Custom options */
  [key: string]: unknown;
}

/**
 * Options for transformation execution.
 */
export interface ExecutionOptions {
  /** Configuration to pass to template */
  config?: TransformationContextConfig;
  
  /** Maximum tokens for output */
  maxTokens?: number;
  
  /** Temperature for generation */
  temperature?: number;
  
  /** Execute asynchronously */
  async?: boolean;
  
  /** Skip caching */
  skipCache?: boolean;
  
  /** Model override */
  modelOverride?: string;
  
  /** Job priority */
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Transformation execution job payload.
 */
export interface TransformationJobPayload {
  /** Job type identifier */
  type?: 'transformation';
  
  /** Tenant ID */
  tenantId?: string;
  
  /** Transformation to execute */
  transformationId: string;
  
  /** Source to transform */
  sourceId?: string;
  
  /** Context for transformation */
  context?: TransformationContext;
  
  /** Execution options */
  options?: ExecutionOptions;
  
  /** Webhook URL for completion notification */
  webhookUrl?: string;
}

/**
 * Token usage for transformation.
 */
export interface TransformationUsage {
  /** Input tokens */
  inputTokens: number;
  
  /** Output tokens */
  outputTokens: number;
  
  /** Total tokens */
  totalTokens: number;
  
  /** Estimated cost in USD */
  cost: number;
}

/**
 * Insight type identifiers.
 */
export type InsightType = 
  | 'summary'
  | 'key-insights'
  | 'action-items'
  | 'mindmap'
  | 'flashcards'
  | 'study-notes'
  | string;

/**
 * Validation result from output parser.
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  
  /** Validation errors if any */
  errors?: string[];
  
  /** Parsed/cleaned data */
  data?: unknown;
}

/**
 * Template definition from YAML file.
 */
export interface TemplateDefinition {
  /** Template name/identifier */
  name: string;
  
  /** Display title */
  title: string;
  
  /** Description */
  description?: string;
  
  /** Output format */
  output_format: OutputFormat;
  
  /** JSON schema for structured output */
  output_schema?: Record<string, unknown>;
  
  /** Auto-apply on source ingestion */
  apply_default?: boolean;
  
  /** Model override ID */
  model_override?: string;
  
  /** Jinja2/Nunjucks template */
  prompt_template: string;
  
  /** Maximum input tokens */
  max_input_tokens?: number;
  
  /** Maximum output tokens */
  max_output_tokens?: number;
}
