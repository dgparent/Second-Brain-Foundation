/**
 * Email to Task Extraction Workflow
 * Uses AEI to extract tasks from email text
 */

import { OllamaProvider } from '@sbf/aei';
import { ArangoDBAdapter } from '@sbf/memory-engine';
import { Entity, Relationship } from '@sbf/shared';
import { createVATask, VATaskEntity } from '../entities/VAEntities';

export interface EmailToTaskConfig {
  aei: {
    provider: 'ollama' | 'openai' | 'anthropic';
    ollamaUrl?: string;
    ollamaModel?: string;
    openaiKey?: string;
    openaiModel?: string;
    anthropicKey?: string;
    anthropicModel?: string;
  };
  memoryEngine: {
    url: string;
    database: string;
    username: string;
    password: string;
  };
}

export interface EmailTaskExtractionResult {
  tasks: VATaskEntity[];
  client?: Entity;
  relationships: Relationship[];
  confidence: number;
}

/**
 * Extract tasks from email content
 */
export class EmailToTaskWorkflow {
  private aeiProvider: OllamaProvider;
  private memoryEngine: ArangoDBAdapter;

  constructor(config: EmailToTaskConfig) {
    // Initialize AEI Provider
    if (config.aei.provider === 'ollama') {
      this.aeiProvider = new OllamaProvider({
        baseUrl: config.aei.ollamaUrl || 'http://localhost:11434',
        model: config.aei.ollamaModel || 'llama3.2:latest',
      });
    } else {
      throw new Error(`Provider ${config.aei.provider} not yet implemented in workflow`);
    }

    // Initialize Memory Engine
    this.memoryEngine = new ArangoDBAdapter({
      url: config.memoryEngine.url,
      database: config.memoryEngine.database,
      username: config.memoryEngine.username,
      password: config.memoryEngine.password,
    });
  }

  async initialize(): Promise<void> {
    await this.memoryEngine.initialize();
  }

  /**
   * Process an email and extract tasks
   */
  async processEmail(emailData: {
    from: string;
    subject: string;
    body: string;
    timestamp?: string;
  }): Promise<EmailTaskExtractionResult> {
    console.log('\n📧 Processing email from:', emailData.from);
    console.log('   Subject:', emailData.subject);

    // Step 1: Extract entities from email
    const fullText = `From: ${emailData.from}\nSubject: ${emailData.subject}\n\n${emailData.body}`;
    
    const extractionPrompt = `
Extract actionable tasks from this email. For each task:
1. Identify the task description
2. Determine priority (low, medium, high, urgent)
3. Extract any due dates mentioned
4. Note the client/sender name

Return JSON in this format:
{
  "client": {
    "name": "client name",
    "email": "email address"
  },
  "tasks": [
    {
      "title": "task description",
      "priority": "medium",
      "due_date": "ISO8601 or null",
      "notes": "additional context"
    }
  ]
}
    `.trim();

    console.log('\n🤖 Extracting tasks with AEI...');
    const extracted = await this.aeiProvider.extractEntities(fullText, {
      systemPrompt: extractionPrompt,
    });

    console.log(`   Found ${extracted.length} potential entities`);

    // Step 2: Parse and structure tasks
    const tasks: VATaskEntity[] = [];
    let clientUid: string | undefined;

    // Try to identify client from email
    const clientName = emailData.from.split('<')[0].trim() || emailData.from.split('@')[0];
    const clientEmail = emailData.from.match(/<(.+)>/)?.[1] || emailData.from;
    
    // Check if client exists, if not create one
    const clientEntity: Entity = {
      uid: `va-client-${clientEmail.replace(/[@.]/g, '-')}`,
      type: 'va-client',
      title: clientName,
      lifecycle: {
        state: 'permanent',
      },
      sensitivity: {
        level: 'confidential',
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: false,
        },
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      metadata: {
        email: clientEmail,
      },
    };

    // Store or update client
    const existingClient = await this.memoryEngine.getEntity(clientEntity.uid);
    if (!existingClient) {
      await this.memoryEngine.createEntity(clientEntity);
      console.log(`   ✅ Created client: ${clientName}`);
    } else {
      console.log(`   ℹ️  Using existing client: ${clientName}`);
    }
    clientUid = clientEntity.uid;

    // Step 3: Create task entities from extracted data
    for (const entity of extracted) {
      if (entity.type === 'task' || entity.name.toLowerCase().includes('task')) {
        const taskUid = `va-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const task = createVATask({
          uid: taskUid,
          title: entity.name,
          client_uid: clientUid,
          priority: this.determinePriority(entity.attributes?.priority as string),
          source: 'email',
          extracted_from: emailData.body,
          confidence: entity.confidence,
        });

        // Store task in memory engine
        await this.memoryEngine.createEntity(task);
        tasks.push(task);
        
        console.log(`   ✅ Created task: ${task.title} (${task.metadata.priority})`);
      }
    }

    // Step 4: Create relationships
    const relationships: Relationship[] = [];
    for (const task of tasks) {
      if (clientUid) {
        const rel: Relationship = {
          type: 'assigned_to',
          source_uid: task.uid,
          target_uid: clientUid,
          created: new Date().toISOString(),
          metadata: {
            confidence: 1.0,
            notes: 'Task assigned to client from email',
          },
        };
        
        await this.memoryEngine.createRelationship(rel);
        relationships.push(rel);
      }
    }

    console.log(`\n✅ Workflow complete: ${tasks.length} tasks extracted`);

    return {
      tasks,
      client: clientEntity,
      relationships,
      confidence: extracted.reduce((acc, e) => acc + e.confidence, 0) / (extracted.length || 1),
    };
  }

  /**
   * Determine priority from text
   */
  private determinePriority(priority?: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (!priority) return 'medium';
    
    const p = priority.toLowerCase();
    if (p.includes('urgent') || p.includes('asap')) return 'urgent';
    if (p.includes('high')) return 'high';
    if (p.includes('low')) return 'low';
    return 'medium';
  }

  /**
   * Get all tasks for a client
   */
  async getClientTasks(clientUid: string): Promise<VATaskEntity[]> {
    const relationships = await this.memoryEngine.getRelationships(clientUid, 'inbound');
    const taskUids = relationships
      .filter((r: any) => r.type === 'assigned_to')
      .map((r: any) => r.source_uid);

    const tasks: VATaskEntity[] = [];
    for (const uid of taskUids) {
      const entity = await this.memoryEngine.getEntity(uid);
      if (entity && entity.type === 'va-task') {
        tasks.push(entity as VATaskEntity);
      }
    }

    return tasks;
  }
}
