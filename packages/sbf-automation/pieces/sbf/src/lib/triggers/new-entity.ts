import {
  createTrigger,
  TriggerStrategy,
  Property,
} from '@activepieces/pieces-framework';
import { sbfAuth, SBFAuthValue } from '../auth';
import { SBFClient } from '../common/sbf-client';

export const newEntityTrigger = createTrigger({
  auth: sbfAuth,
  name: 'new_entity',
  displayName: 'New Entity Created',
  description: 'Triggers when a new entity is created in SBF',
  type: TriggerStrategy.WEBHOOK,
  
  props: {
    entity_type: Property.StaticDropdown({
      displayName: 'Entity Type',
      description: 'Filter by entity type',
      required: false,
      options: {
        options: [
          { label: 'All Types', value: '*' },
          { label: 'VA Task', value: 'va.task' },
          { label: 'VA Meeting', value: 'va.meeting' },
          { label: 'VA Client', value: 'va.client' },
          { label: 'VA Report', value: 'va.report' },
          { label: 'VA SOP', value: 'va.sop' },
        ],
      },
    }),
    client_uid: Property.ShortText({
      displayName: 'Client UID (Optional)',
      description: 'Only trigger for specific client',
      required: false,
    }),
  },
  
  sampleData: {
    event: 'entity.created',
    entity: {
      uid: 'va-task-sample-001',
      type: 'va.task',
      client_uid: 'va-client-acme-001',
      title: 'Sample Task',
      priority: 'normal',
      status: 'pending',
      created_at: '2025-11-20T22:00:00Z',
    },
    timestamp: '2025-11-20T22:00:00Z',
  },
  
  async onEnable(context) {
    const auth = context.auth as SBFAuthValue;
    const client = new SBFClient(auth);
    const { entity_type, client_uid } = context.propsValue;
    
    // Register webhook with SBF
    const webhookUrl = context.webhookUrl;
    
    const response = await client.registerWebhook(webhookUrl, {
      entity_type: entity_type === '*' ? null : entity_type,
      client_uid: client_uid || null,
    });
    
    if (!response.success) {
      throw new Error(`Failed to register webhook: ${response.error}`);
    }
    
    console.log(`Webhook registered: ${webhookUrl}`);
  },
  
  async onDisable(context) {
    const auth = context.auth as SBFAuthValue;
    const client = new SBFClient(auth);
    const webhookUrl = context.webhookUrl;
    
    // Unregister webhook
    const response = await client.unregisterWebhook(webhookUrl);
    
    if (!response.success) {
      console.warn(`Failed to unregister webhook: ${response.error}`);
    }
    
    console.log(`Webhook unregistered: ${webhookUrl}`);
  },
  
  async run(context) {
    const { body } = context.payload;
    
    // SBF webhook payload structure
    return [
      {
        event: body.event || 'entity.created',
        entity: body.entity || {},
        timestamp: body.timestamp || new Date().toISOString(),
      },
    ];
  },
  
  async test(context) {
    // Return sample data for testing
    return [
      {
        event: 'entity.created',
        entity: {
          uid: 'va-task-test-001',
          type: 'va.task',
          client_uid: 'va-client-test',
          title: 'Test Task from Webhook',
          priority: 'normal',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
    ];
  },
});
