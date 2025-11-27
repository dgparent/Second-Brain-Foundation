import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { IntentClassifier } from './IntentClassifier';
import { VAAction, VAResponse } from './types';
import { CreateNoteAction } from './actions/CreateNoteAction';
import { QuestionAction } from './actions/QuestionAction';
import { OrchestratorAgent, AgentPersona } from './OrchestratorAgent';
import { ConstitutionManager } from './ConstitutionManager';

export class VAService {
  private classifier: IntentClassifier;
  private actions: VAAction[] = [];
  private orchestrator: OrchestratorAgent;
  private constitution: ConstitutionManager;

  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {
    this.classifier = new IntentClassifier(aiProvider);
    this.constitution = new ConstitutionManager(entityManager, aiProvider);
    this.orchestrator = new OrchestratorAgent(aiProvider, this.constitution);
    this.registerDefaultActions();
  }

  setPersona(persona?: AgentPersona) {
    this.orchestrator.setPersona(persona);
  }

  private registerDefaultActions() {
    this.actions.push(new CreateNoteAction(this.entityManager));
    this.actions.push(new QuestionAction(this.entityManager, this.aiProvider));
    // Add more actions here
  }

  registerAction(action: VAAction) {
    this.actions.push(action);
  }

  async processQuery(query: string): Promise<VAResponse> {
    try {
      // 0. Check if we should use the Orchestrator (for complex queries)
      // For now, let's use Orchestrator if the query is long or complex, 
      // but stick to the fast path for simple intents.
      
      // 1. Classify Intent (Fast Path)
      const intent = await this.classifier.classify(query);
      console.log(`Classified intent: ${intent.type} (Confidence: ${intent.confidence})`);

      // 2. Find matching action
      const action = this.actions.find(a => a.canHandle(intent));

      if (action && intent.confidence > 0.7) {
        // Fast path: We know exactly what to do
        return await action.execute(intent);
      }

      // 3. Fallback to Orchestrator (Slow Path / Complex Path)
      console.log('Intent unclear or complex, delegating to Orchestrator...');
      const availableAgents = this.actions.map(a => a.name);
      return await this.orchestrator.planAndExecute(query, availableAgents);

    } catch (error) {
      console.error('Error processing VA query:', error);
      return {
        success: false,
        message: 'An internal error occurred while processing your request.'
      };
    }
  }

  async getConstitution() {
    return await this.constitution.getAllRules();
  }

  async updateConstitution(rules: any[]) {
    // Ensure rules match the interface
    this.constitution.setRules(rules);
  }
}
