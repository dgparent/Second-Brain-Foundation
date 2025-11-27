import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class SBFTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SBF Trigger',
		name: 'sbfTrigger',
		icon: 'file:sbf.svg',
		group: ['trigger'],
		version: 1,
		description: 'Trigger workflow on SBF entity events',
		defaults: {
			name: 'SBF Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'sbfApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				options: [
					{
						name: 'Entity Created',
						value: 'entity.created',
					},
					{
						name: 'Entity Updated',
						value: 'entity.updated',
					},
				],
				default: ['entity.created'],
				description: 'Events that trigger this webhook',
			},
			{
				displayName: 'Filter by Entity Type',
				name: 'entity_type',
				type: 'options',
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
				description: 'Only trigger for specific entity types',
			},
			{
				displayName: 'Filter by Client UID',
				name: 'client_uid',
				type: 'string',
				default: '',
				placeholder: 'va-client-acme-001',
				description: 'Only trigger for specific client',
			},
		],
	};

	// Register webhook when workflow is activated
	async webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const credentials = await this.getCredentials('sbfApi');
				const baseUrl = credentials.baseUrl as string;
				const apiKey = credentials.apiKey as string;

				// Check if webhook exists
				try {
					const response = await this.helpers.request({
						method: 'GET',
						url: `${baseUrl}/api/v1/webhooks`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
						},
						json: true,
					});

					if (response.success && Array.isArray(response.data)) {
						return response.data.some((wh: any) => wh.url === webhookUrl);
					}
					return false;
				} catch (error) {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const credentials = await this.getCredentials('sbfApi');
				const baseUrl = credentials.baseUrl as string;
				const apiKey = credentials.apiKey as string;

				const events = this.getNodeParameter('events') as string[];
				const entity_type = this.getNodeParameter('entity_type', '') as string;
				const client_uid = this.getNodeParameter('client_uid', '') as string;

				const filters: any = {};
				if (entity_type) filters.entity_type = entity_type;
				if (client_uid) filters.client_uid = client_uid;

				const body = {
					url: webhookUrl,
					events,
					filters,
					active: true,
				};

				try {
					const response = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/v1/webhooks`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					});

					if (!response.success) {
						return false;
					}

					// Store webhook ID for deletion
					const webhookData = this.getWorkflowStaticData('node');
					webhookData.webhookId = response.data.webhook_id;

					return true;
				} catch (error) {
					return false;
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId;

				if (!webhookId) {
					return true;
				}

				const credentials = await this.getCredentials('sbfApi');
				const baseUrl = credentials.baseUrl as string;
				const apiKey = credentials.apiKey as string;

				try {
					await this.helpers.request({
						method: 'DELETE',
						url: `${baseUrl}/api/v1/webhooks?webhook_id=${webhookId}`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
						},
						json: true,
					});

					delete webhookData.webhookId;
					return true;
				} catch (error) {
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();

		// Return the webhook payload
		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData as any),
			],
		};
	}
}
