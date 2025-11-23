import { createAction, Property } from '@activepieces/pieces-framework';
import { sbfAuth, SBFAuthValue } from '../auth';
import { SBFClient } from '../common/sbf-client';

export const queryEntitiesAction = createAction({
  auth: sbfAuth,
  name: 'query_entities',
  displayName: 'Query Entities',
  description: 'Search and retrieve entities from SBF',
  props: {
    entity_type: Property.StaticDropdown({
      displayName: 'Entity Type',
      description: 'Filter by entity type',
      required: false,
      options: {
        options: [
          { label: 'All Types', value: '' },
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
      description: 'Filter by specific client',
      required: false,
    }),
    limit: Property.Number({
      displayName: 'Limit',
      description: 'Maximum number of results',
      required: false,
      defaultValue: 100,
    }),
  },
  
  async run(context) {
    const auth = context.auth as SBFAuthValue;
    const client = new SBFClient(auth);
    
    const { entity_type, client_uid, limit } = context.propsValue;
    
    const response = await client.queryEntities({
      type: entity_type || undefined,
      client_uid: client_uid || undefined,
      limit: limit || 100,
    });
    
    if (!response.success) {
      throw new Error(`Failed to query entities: ${response.error}`);
    }
    
    return {
      success: true,
      entities: response.data || [],
      count: Array.isArray(response.data) ? response.data.length : 0,
    };
  },
});
