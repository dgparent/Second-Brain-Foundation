import { INodeProperties } from 'n8n-workflow';

export const createTaskFields: INodeProperties[] = [
	{
		displayName: 'Client UID',
		name: 'client_uid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		default: '',
		placeholder: 'va-client-acme-001',
		description: 'Client identifier for task isolation',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		default: '',
		placeholder: 'Follow up with client',
		description: 'Task title',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		default: '',
		description: 'Detailed task description',
	},
	{
		displayName: 'Priority',
		name: 'priority',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		options: [
			{
				name: 'Low',
				value: 'low',
			},
			{
				name: 'Normal',
				value: 'normal',
			},
			{
				name: 'High',
				value: 'high',
			},
			{
				name: 'Urgent',
				value: 'urgent',
			},
		],
		default: 'normal',
		description: 'Task priority level',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		options: [
			{
				name: 'Pending',
				value: 'pending',
			},
			{
				name: 'In Progress',
				value: 'in_progress',
			},
			{
				name: 'Blocked',
				value: 'blocked',
			},
			{
				name: 'Done',
				value: 'done',
			},
		],
		default: 'pending',
		description: 'Initial task status',
	},
	{
		displayName: 'Due Date',
		name: 'due_date',
		type: 'dateTime',
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		default: '',
		description: 'When the task is due',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		default: '',
		placeholder: 'urgent, follow-up, email',
		description: 'Comma-separated tags',
	},
	{
		displayName: 'Assigned To',
		name: 'assigned_to',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['createTask'],
			},
		},
		default: '',
		placeholder: 'va@example.com',
		description: 'Email or username of assigned VA',
	},
];
