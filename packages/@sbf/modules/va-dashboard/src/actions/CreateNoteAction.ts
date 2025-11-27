
import { BaseAction } from './BaseAction';
import { VAIntent, VAResponse } from '../types';

export class CreateNoteAction extends BaseAction {
  id = 'create_note';
  name = 'Create Note';
  description = 'Creates a new note entity';

  canHandle(intent: VAIntent): boolean {
    return intent.type === 'create_note';
  }

  async execute(intent: VAIntent): Promise<VAResponse> {
    try {
      const content = intent.entities.content || intent.originalQuery;
      const title = content.split('\n')[0].substring(0, 50) || 'New Note';

      const entity = await this.entityManager.create({
        title,
        type: 'note',
        content,
        lifecycle: { state: 'capture' },
        sensitivity: { level: 'personal' }
      } as any); // Cast as any because Entity type might be strict

      return {
        success: true,
        message: `Note created: ${title}`,
        data: entity,
        actionTaken: 'create_note'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create note: ${(error as Error).message}`
      };
    }
  }
}
