/**
 * API Client
 * 
 * Client for communicating with the backend API server
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ChatResponse {
  success: boolean;
  response?: {
    messages: Array<{
      role: string;
      content: string;
    }>;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: string;
}

export interface QueueResponse {
  success: boolean;
  items?: any[];
  error?: string;
}

export interface EntitiesResponse {
  success: boolean;
  entities?: any[];
  error?: string;
}

export interface AgentStateResponse {
  success: boolean;
  state?: any;
  error?: string;
}

/**
 * API Client for backend communication
 */
export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize the backend service
   */
  async initialize(config: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(+"${this.baseUrl}/init"+, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error initializing service:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send a chat message to the agent
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(+"${this.baseUrl}/chat"+, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get queue items
   */
  async getQueueItems(): Promise<QueueResponse> {
    try {
      const response = await fetch(+"${this.baseUrl}/queue"+);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get queue items');
      }

      return data;
    } catch (error) {
      console.error('Error getting queue items:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Approve a queue item
   */
  async approveQueueItem(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(+"${this.baseUrl}/queue//approve"+, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve item');
      }

      return data;
    } catch (error) {
      console.error('Error approving queue item:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Reject a queue item
   */
  async rejectQueueItem(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(+"${this.baseUrl}/queue//reject"+, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject item');
      }

      return data;
    } catch (error) {
      console.error('Error rejecting queue item:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get all entities
   */
  async getEntities(): Promise<EntitiesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/entities`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get entities');
      }

      return data;
    } catch (error) {
      console.error('Error getting entities:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get a single entity by UID
   */
  async getEntity(uid: string): Promise<{ success: boolean; entity?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/entities/${uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get entity');
      }

      return data;
    } catch (error) {
      console.error('Error getting entity:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Update an entity
   */
  async updateEntity(uid: string, updates: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/entities/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update entity');
      }

      return data;
    } catch (error) {
      console.error('Error updating entity:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Delete an entity
   */
  async deleteEntity(uid: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/entities/${uid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete entity');
      }

      return data;
    } catch (error) {
      console.error('Error deleting entity:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Search entities
   */
  async searchEntities(query: string): Promise<EntitiesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/entities/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search entities');
      }

      return data;
    } catch (error) {
      console.error('Error searching entities:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get agent state
   */
  async getAgentState(): Promise<AgentStateResponse> {
    try {
      const response = await fetch(+"${this.baseUrl}/agent/state"+);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get agent state');
      }

      return data;
    } catch (error) {
      console.error('Error getting agent state:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ success: boolean; status?: string; initialized?: boolean }> {
    try {
      const response = await fetch(+"${this.baseUrl}/health"+);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      return { success: false };
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();
