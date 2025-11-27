import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import type { TenantContext } from '@sbf/shared';

neonConfig.webSocketConstructor = ws;

export class DatabaseClient {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async withTenant<T>(
    context: TenantContext,
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      // Set tenant context for RLS
      await client.query(
        'SELECT set_config($1, $2, true)',
        ['app.current_tenant_id', context.tenant_id]
      );

      if (context.user_id) {
        await client.query(
          'SELECT set_config($1, $2, true)',
          ['app.current_user_id', context.user_id]
        );
      }

      return await callback(client);
    } finally {
      client.release();
    }
  }

  async query(text: string, params?: any[]): Promise<any>;
  async query<T>(context: TenantContext, text: string, params?: any[]): Promise<{ rows: T[] }>;
  async query<T>(
    arg1: string | TenantContext,
    arg2?: any[] | string,
    arg3?: any[]
  ): Promise<any> {
    if (typeof arg1 === 'string') {
      // Simple query without context
      return this.pool.query(arg1, arg2 as any[]);
    } else {
      // Query with tenant context
      const context = arg1 as TenantContext;
      const text = arg2 as string;
      const params = arg3;

      return this.withTenant(context, async (client) => {
        return client.query(text, params);
      });
    }
  }

  async end() {
    await this.pool.end();
  }
}

let dbClient: DatabaseClient | null = null;

export function getDbClient(): DatabaseClient {
  if (!dbClient) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    dbClient = new DatabaseClient(connectionString);
  }
  return dbClient;
}

export async function closeDbClient() {
  if (dbClient) {
    await dbClient.end();
    dbClient = null;
  }
}

// Legacy export for compatibility
export const db = getDbClient();
