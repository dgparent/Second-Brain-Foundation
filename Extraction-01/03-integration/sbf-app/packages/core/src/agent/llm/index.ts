/**
 * LLM Integration Module
 * Local and cloud LLM providers
 */

// Placeholder for LLM implementations
// Will be filled during implementation

export interface LLMInterface {
  generate(context: string, prompt: string): Promise<string>;
}
