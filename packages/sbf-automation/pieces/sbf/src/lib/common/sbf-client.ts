import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { SBFAuthValue } from '../auth';

export interface SBFEntity {
  uid?: string;
  type: string;
  client_uid: string;
  [key: string]: any;
}

export interface SBFResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SBFClient {
  constructor(private auth: SBFAuthValue) {}

  async createEntity(entity: SBFEntity): Promise<SBFResponse> {
    try {
      const response = await httpClient.sendRequest<SBFResponse>({
        method: HttpMethod.POST,
        url: `${this.auth.baseUrl}/api/v1/entities`,
        headers: {
          'Authorization': `Bearer ${this.auth.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: entity,
      });

      return response.body;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create entity',
      };
    }
  }

  async queryEntities(params: {
    type?: string;
    client_uid?: string;
    limit?: number;
  }): Promise<SBFResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.append('type', params.type);
      if (params.client_uid) queryParams.append('client_uid', params.client_uid);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await httpClient.sendRequest<SBFResponse>({
        method: HttpMethod.GET,
        url: `${this.auth.baseUrl}/api/v1/entities?${queryParams}`,
        headers: {
          'Authorization': `Bearer ${this.auth.apiKey}`,
        },
      });

      return response.body;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to query entities',
      };
    }
  }

  async getEntity(uid: string): Promise<SBFResponse> {
    try {
      const response = await httpClient.sendRequest<SBFResponse>({
        method: HttpMethod.GET,
        url: `${this.auth.baseUrl}/api/v1/entities/${uid}`,
        headers: {
          'Authorization': `Bearer ${this.auth.apiKey}`,
        },
      });

      return response.body;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get entity',
      };
    }
  }

  async updateEntity(uid: string, updates: Partial<SBFEntity>): Promise<SBFResponse> {
    try {
      const response = await httpClient.sendRequest<SBFResponse>({
        method: HttpMethod.PATCH,
        url: `${this.auth.baseUrl}/api/v1/entities/${uid}`,
        headers: {
          'Authorization': `Bearer ${this.auth.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: updates,
      });

      return response.body;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update entity',
      };
    }
  }

  async registerWebhook(webhookUrl: string, filters?: any): Promise<SBFResponse> {
    try {
      const response = await httpClient.sendRequest<SBFResponse>({
        method: HttpMethod.POST,
        url: `${this.auth.baseUrl}/api/v1/webhooks`,
        headers: {
          'Authorization': `Bearer ${this.auth.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          url: webhookUrl,
          events: ['entity.created', 'entity.updated'],
          filters: filters || {},
        },
      });

      return response.body;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to register webhook',
      };
    }
  }

  async unregisterWebhook(webhookUrl: string): Promise<SBFResponse> {
    try {
      const response = await httpClient.sendRequest<SBFResponse>({
        method: HttpMethod.DELETE,
        url: `${this.auth.baseUrl}/api/v1/webhooks`,
        headers: {
          'Authorization': `Bearer ${this.auth.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          url: webhookUrl,
        },
      });

      return response.body;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to unregister webhook',
      };
    }
  }
}
