import { createAction, Property } from '@activepieces/pieces-framework';
import { sbfAuth, SBFAuthValue } from '../auth';
import { SBFClient } from '../common/sbf-client';

export const createTaskAction = createAction({
  auth: sbfAuth,
  name: 'create_task',
  displayName: 'Create Task',
  description: 'Create a new task in SBF with client isolation',
  props: {
    client_uid: Property.ShortText({
      displayName: 'Client UID',
      description: 'VA client identifier (e.g., va-client-acme-001)',
      required: true,
    }),
    title: Property.ShortText({
      displayName: 'Task Title',
      description: 'Brief title for the task',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      description: 'Detailed task description',
      required: false,
    }),
    priority: Property.StaticDropdown({
      displayName: 'Priority',
      description: 'Task priority level',
      required: true,
      defaultValue: 'normal',
      options: {
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' },
          { label: 'Urgent', value: 'urgent' },
        ],
      },
    }),
    status: Property.StaticDropdown({
      displayName: 'Status',
      description: 'Initial task status',
      required: false,
      defaultValue: 'pending',
      options: {
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Blocked', value: 'blocked' },
          { label: 'Done', value: 'done' },
        ],
      },
    }),
    due_date: Property.DateTime({
      displayName: 'Due Date',
      description: 'When the task is due',
      required: false,
    }),
    tags: Property.Array({
      displayName: 'Tags',
      description: 'Task tags/labels (e.g., ["email", "urgent"])',
      required: false,
    }),
    assigned_to: Property.ShortText({
      displayName: 'Assigned To',
      description: 'VA email or username',
      required: false,
    }),
  },
  
  async run(context) {
    const auth = context.auth as SBFAuthValue;
    const client = new SBFClient(auth);
    
    const { client_uid, title, description, priority, status, due_date, tags, assigned_to } = context.propsValue;
    
    // Construct task entity
    const taskEntity = {
      type: 'va.task',
      client_uid,
      title,
      description: description || '',
      priority,
      status: status || 'pending',
      due_date: due_date ? new Date(due_date).toISOString() : null,
      tags: tags || [],
      assigned_to: assigned_to || null,
      created_at: new Date().toISOString(),
      source: 'activepieces',
      source_metadata: {
        piece: 'sbf',
        action: 'create_task',
        execution_id: context.run.id,
      },
    };
    
    // Create entity in SBF
    const response = await client.createEntity(taskEntity);
    
    if (!response.success) {
      throw new Error(`Failed to create task: ${response.error}`);
    }
    
    return {
      success: true,
      task: response.data,
      uid: response.data?.uid,
      message: `Task created successfully for client ${client_uid}`,
    };
  },
});
