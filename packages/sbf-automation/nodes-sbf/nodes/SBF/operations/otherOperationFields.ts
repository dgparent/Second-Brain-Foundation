import { INodeProperties } from 'n8n-workflow';

export const queryEntitiesFields: INodeProperties[] = [
	{
		displayName: 'Entity Type',
		name: 'type',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['queryEntities'],
			},
		},
		options: [
			{
				name: 'All Types',
				value: '',
			},
			{
				name: 'Tasks',
				value: 'va.task',
			},
			{
				name: 'Meetings',
				value: 'va.meeting',
			},
			{
				name: 'Clients',
				value: 'va.client',
			},
		],
		default: '',
		description: 'Filter by entity type',
	},
	{
		displayName: 'Client UID',
		name: 'client_uid',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['queryEntities'],
			},
		},
		default: '',
		placeholder: 'va-client-acme-001',
		description: 'Filter by specific client',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['queryEntities'],
			},
		},
		default: 100,
		description: 'Maximum number of results',
	},
];

export const getEntityFields: INodeProperties[] = [
	{
		displayName: 'Entity UID',
		name: 'uid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['getEntity'],
			},
		},
		default: '',
		placeholder: 'va-task-abc123',
		description: 'Unique identifier of the entity',
	},
];

export const updateEntityFields: INodeProperties[] = [
	{
		displayName: 'Entity UID',
		name: 'uid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['updateEntity'],
			},
		},
		default: '',
		placeholder: 'va-task-abc123',
		description: 'Unique identifier of the entity to update',
	},
	{
		displayName: 'Updates (JSON)',
		name: 'updates',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				operation: ['updateEntity'],
			},
		},
		default: '{\n  "status": "done"\n}',
		description: 'JSON object with fields to update',
	},
];
