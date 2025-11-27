import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';

export interface ConstitutionRule {
  id: string;
  category: 'preference' | 'workflow' | 'constraint';
  content: string;
  created: Date;
  lastUpdated: Date;
  confidence: number; // How sure we are this is a rule
}

export class ConstitutionManager {
  private rules: ConstitutionRule[] = [];
  private readonly ENTITY_TYPE = 'system_constitution';

  constructor(
    private entityManager: EntityManager,
    private aiProvider?: BaseAIProvider
  ) {}

  async load() {
    // Load from EntityManager
    const entities = await this.entityManager.getAll();
    const constitutionEntity = entities.find(e => e.type === this.ENTITY_TYPE);
    
    if (constitutionEntity && constitutionEntity.content) {
      try {
        this.rules = JSON.parse(constitutionEntity.content);
      } catch (e) {
        console.error('Failed to parse constitution:', e);
        this.rules = [];
      }
    }
  }

  async save() {
    // Save to EntityManager
    const entities = await this.entityManager.getAll();
    let constitutionEntity = entities.find(e => e.type === this.ENTITY_TYPE);

    if (constitutionEntity) {
      await this.entityManager.update(constitutionEntity.uid, {
        content: JSON.stringify(this.rules),
        updated: new Date().toISOString()
      });
    } else {
      await this.entityManager.create({
        type: this.ENTITY_TYPE,
        title: 'System Constitution',
        content: JSON.stringify(this.rules),
        metadata: {
          description: 'Stores user preferences and system rules for the Orchestrator Agent.'
        },
        lifecycle: { state: 'permanent' },
        sensitivity: { 
          level: 'confidential',
          privacy: {
            cloud_ai_allowed: false,
            local_ai_allowed: true,
            export_allowed: false
          }
        }
      });
    }
  }

  getRules(category?: string): string[] {
    if (category) {
      return this.rules.filter(r => r.category === category).map(r => r.content);
    }
    return this.rules.map(r => r.content);
  }

  addRule(content: string, category: 'preference' | 'workflow' | 'constraint' = 'preference') {
    this.rules.push({
      id: Math.random().toString(36).substring(7),
      category,
      content,
      created: new Date(),
      lastUpdated: new Date(),
      confidence: 1.0
    });
    this.save();
  }

  setRules(rules: ConstitutionRule[]) {
    this.rules = rules;
    this.save();
  }

  async getAllRules(): Promise<ConstitutionRule[]> {
    if (this.rules.length === 0) {
      await this.load();
    }
    return this.rules;
  }

  async evolve(interaction: { userQuery: string, systemAction: string, userFeedback: string }) {
    if (!this.aiProvider) {
      console.warn('Cannot evolve constitution: No AI provider available');
      return;
    }

    console.log('Evolving constitution based on feedback:', interaction);

    try {
      const prompt = `
        Analyze the following interaction between a user and the system to identify if a new rule or preference should be added to the system constitution.
        
        User Query: "${interaction.userQuery}"
        System Action: "${interaction.systemAction}"
        User Feedback: "${interaction.userFeedback}"
        
        Current Rules:
        ${this.rules.map(r => `- ${r.content}`).join('\n')}
        
        If the user feedback implies a new preference or constraint, formulate it as a clear, concise rule.
        If no new rule is needed, respond with "NO_CHANGE".
        
        Format:
        CATEGORY: [preference|workflow|constraint]
        RULE: [The rule content]
      `;

      const response = await this.aiProvider.chat([{ role: 'user', content: prompt }]);
      
      if (response.includes('NO_CHANGE')) {
        return;
      }

      const categoryMatch = response.match(/CATEGORY:\s*(preference|workflow|constraint)/i);
      const ruleMatch = response.match(/RULE:\s*(.+)/i);

      if (categoryMatch && ruleMatch) {
        const category = categoryMatch[1].toLowerCase() as 'preference' | 'workflow' | 'constraint';
        const content = ruleMatch[1].trim();
        
        // Check for duplicates
        if (!this.rules.some(r => r.content === content)) {
          this.addRule(content, category);
          console.log(`Added new constitution rule: [${category}] ${content}`);
        }
      }
    } catch (error) {
      console.error('Error evolving constitution:', error);
    }
  }
}
