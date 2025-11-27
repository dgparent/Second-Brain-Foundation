import { INodeProperties } from 'n8n-workflow';

export const createMeetingFields: INodeProperties[] = [
	{
		displayName: 'Client UID',
		name: 'client_uid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		default: '',
		placeholder: 'va-client-acme-001',
		description: 'Client identifier',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		default: '',
		placeholder: 'Q4 Planning Session',
		description: 'Meeting title',
	},
	{
		displayName: 'Scheduled Time',
		name: 'scheduled_time',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		default: '',
		description: 'When the meeting is scheduled',
	},
	{
		displayName: 'Duration (Minutes)',
		name: 'duration_minutes',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		default: 60,
		description: 'Meeting duration in minutes',
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		options: [
			{
				name: 'Zoom',
				value: 'zoom',
			},
			{
				name: 'Google Meet',
				value: 'google-meet',
			},
			{
				name: 'Microsoft Teams',
				value: 'teams',
			},
			{
				name: 'Phone',
				value: 'phone',
			},
			{
				name: 'In Person',
				value: 'in-person',
			},
		],
		default: 'zoom',
		description: 'Meeting platform',
	},
	{
		displayName: 'Meeting Link',
		name: 'meeting_link',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		default: '',
		placeholder: 'https://zoom.us/j/123456789',
		description: 'URL for virtual meeting',
	},
	{
		displayName: 'Attendees',
		name: 'attendees',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		default: '',
		placeholder: 'john@example.com, sarah@example.com',
		description: 'Comma-separated list of attendee emails',
	},
	{
		displayName: 'Agenda',
		name: 'agenda',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				operation: ['createMeeting'],
			},
		},
		default: '',
		placeholder: '1. Review Q3\n2. Plan Q4\n3. Discussion',
		description: 'Meeting agenda',
	},
];
