import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { operations } from './operations';
import { createTaskFields } from './operations/createTaskFields';
import { createMeetingFields } from './operations/createMeetingFields';
import { queryEntitiesFields, getEntityFields, updateEntityFields } from './operations/otherOperationFields';

export class SBF implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SBF',
		name: 'sbf',
		icon: 'file:sbf.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Second Brain Foundation',
		defaults: {
			name: 'SBF',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'sbfApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: operations,
				default: 'createTask',
			},
			...createTaskFields,
			...createMeetingFields,
			...queryEntitiesFields,
			...getEntityFields,
			...updateEntityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('sbfApi');
		const baseUrl = credentials.baseUrl as string;
		const apiKey = credentials.apiKey as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'createTask') {
					const client_uid = this.getNodeParameter('client_uid', i) as string;
					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;
					const priority = this.getNodeParameter('priority', i) as string;
					const status = this.getNodeParameter('status', i) as string;
					const due_date = this.getNodeParameter('due_date', i, '') as string;
					const tagsString = this.getNodeParameter('tags', i, '') as string;
					const assigned_to = this.getNodeParameter('assigned_to', i, '') as string;

					const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : [];

					const body = {
						type: 'va.task',
						client_uid,
						title,
						description,
						priority,
						status,
						due_date: due_date || null,
						tags,
						assigned_to: assigned_to || null,
						source: 'n8n',
						source_metadata: {
							node: 'sbf',
							workflow_id: this.getWorkflow().id,
							execution_id: this.getExecutionId(),
						},
					};

					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/api/v1/entities`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					});

					returnData.push(response as IDataObject);
				}

				if (operation === 'createMeeting') {
					const client_uid = this.getNodeParameter('client_uid', i) as string;
					const title = this.getNodeParameter('title', i) as string;
					const scheduled_time = this.getNodeParameter('scheduled_time', i) as string;
					const duration_minutes = this.getNodeParameter('duration_minutes', i, 60) as number;
					const platform = this.getNodeParameter('platform', i) as string;
					const meeting_link = this.getNodeParameter('meeting_link', i, '') as string;
					const attendeesString = this.getNodeParameter('attendees', i, '') as string;
					const agenda = this.getNodeParameter('agenda', i, '') as string;

					const attendees = attendeesString ? attendeesString.split(',').map(e => e.trim()) : [];

					const body = {
						type: 'va.meeting',
						client_uid,
						title,
						scheduled_time,
						duration_minutes,
						platform,
						meeting_link: meeting_link || null,
						attendees,
						agenda,
						status: 'scheduled',
						source: 'n8n',
						source_metadata: {
							node: 'sbf',
							workflow_id: this.getWorkflow().id,
							execution_id: this.getExecutionId(),
						},
					};

					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/api/v1/entities`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					});

					returnData.push(response as IDataObject);
				}

				if (operation === 'queryEntities') {
					const type = this.getNodeParameter('type', i, '') as string;
					const client_uid = this.getNodeParameter('client_uid', i, '') as string;
					const limit = this.getNodeParameter('limit', i, 100) as number;

					const params = new URLSearchParams();
					if (type) params.append('type', type);
					if (client_uid) params.append('client_uid', client_uid);
					params.append('limit', limit.toString());

					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/api/v1/entities?${params}`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
						},
						json: true,
					});

					returnData.push(response as IDataObject);
				}

				if (operation === 'getEntity') {
					const uid = this.getNodeParameter('uid', i) as string;

					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/api/v1/entities/${uid}`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
						},
						json: true,
					});

					returnData.push(response as IDataObject);
				}

				if (operation === 'updateEntity') {
					const uid = this.getNodeParameter('uid', i) as string;
					const updates = this.getNodeParameter('updates', i) as IDataObject;

					const response = await this.helpers.httpRequest({
						method: 'PATCH',
						url: `${baseUrl}/api/v1/entities/${uid}`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body: updates,
						json: true,
					});

					returnData.push(response as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
