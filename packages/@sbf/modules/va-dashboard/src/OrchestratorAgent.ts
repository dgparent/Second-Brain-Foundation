import { BaseAIProvider } from '@sbf/aei';
import { ConstitutionManager } from './ConstitutionManager';
import { VAIntent, VAResponse } from './types';

export interface AgentTask {
  id: string;
  description: string;
  assignedAgent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

export interface AgentPersona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  supersedesConstitution: boolean;
}

export class OrchestratorAgent {
  private activePersona?: AgentPersona;

  constructor(
    private aiProvider: BaseAIProvider,
    private constitution: ConstitutionManager
  ) {}

  setPersona(persona?: AgentPersona) {
    this.activePersona = persona;
  }

  async planAndExecute(query: string, availableAgents: string[]): Promise<VAResponse> {
    // 1. Load Constitution (User Preferences)
    await this.constitution.load();
    let rules = this.constitution.getRules().join('\n');

    // 2. Apply Persona Logic
    let systemContext = 'You are the Orchestrator Agent.';
    
    if (this.activePersona) {
      systemContext = `You are ${this.activePersona.name}. ${this.activePersona.systemPrompt}`;
      
      if (this.activePersona.supersedesConstitution) {
        rules = `[PERSONA OVERRIDE ACTIVE]\nThe following persona instructions supersede standard rules:\n${this.activePersona.systemPrompt}\n\nStandard Rules (Secondary):\n${rules}`;
      } else {
        rules = `${rules}\n\nPersona Instructions:\n${this.activePersona.systemPrompt}`;
      }
    }

    // 3. Plan: Decompose query into tasks
    const plan = await this.createPlan(query, rules, availableAgents, systemContext);
    
    if (plan.tasks.length === 0) {
      return { success: false, message: "I couldn't figure out how to help with that." };
    }

    // 3. Execute: Run tasks (Parallel where possible)
    // For simplicity in this v1, we'll run them in parallel if they don't depend on each other
    // But for now, let's just run them all and aggregate results.
    
    const results = await Promise.all(plan.tasks.map(async (task) => {
      try {
        // In a real system, we would route to specific agent classes.
        // Here we mock the execution or call a generic handler.
        return {
          taskId: task.id,
          status: 'completed',
          result: `Executed ${task.assignedAgent} for: ${task.description}`
        };
      } catch (e) {
        return { taskId: task.id, status: 'failed', error: e };
      }
    }));

    // 4. Synthesize: Combine results into final answer
    const finalResponse = await this.synthesizeResults(query, results);

    return {
      success: true,
      message: finalResponse,
      data: { plan, results }
    };
  }

  private async createPlan(query: string, rules: string, agents: string[], systemContext: string): Promise<{ tasks: AgentTask[] }> {
    const prompt = `
${systemContext}
User Query: "${query}"
System Constitution (Rules & Preferences):
${rules}

Available Agents: ${agents.join(', ')}

Break down the user query into a list of tasks to be executed by the available agents.
Return a JSON object: { "tasks": [ { "id": "1", "description": "...", "assignedAgent": "..." } ] }
`;

    const response = await this.aiProvider.chat([
      { role: 'system', content: prompt }
    ]);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { tasks: [] };
    } catch (e) {
      console.error('Failed to parse plan:', e);
      return { tasks: [] };
    }
  }

  private async synthesizeResults(query: string, results: any[]): Promise<string> {
    const prompt = `
User Query: "${query}"
Task Results:
${JSON.stringify(results, null, 2)}

Synthesize these results into a helpful response for the user.
`;
    return this.aiProvider.chat([{ role: 'system', content: prompt }]);
  }
}
