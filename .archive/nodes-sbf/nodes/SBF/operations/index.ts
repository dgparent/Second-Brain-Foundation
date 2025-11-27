import { INodePropertyOptions } from 'n8n-workflow';

export const operations: INodePropertyOptions[] = [
	{
		name: 'Create Task',
		value: 'createTask',
		description: 'Create a new VA task',
		action: 'Create a task',
	},
	{
		name: 'Create Meeting',
		value: 'createMeeting',
		description: 'Create a new meeting record',
		action: 'Create a meeting',
	},
	{
		name: 'Query Entities',
		value: 'queryEntities',
		description: 'Search and retrieve entities',
		action: 'Query entities',
	},
	{
		name: 'Get Entity',
		value: 'getEntity',
		description: 'Get entity by UID',
		action: 'Get an entity',
	},
	{
		name: 'Update Entity',
		value: 'updateEntity',
		description: 'Update an existing entity',
		action: 'Update an entity',
	},
];
