import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface AppConfig {
  ai: {
    provider: 'ollama' | 'openai' | 'anthropic';
    baseUrl: string;
    apiKey?: string;
    embeddingModel: string;
    chatModel: string;
    ingestion: {
      chunkSize: number;
      chunkOverlap: number;
    };
  };
  database: {
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
    ssl: boolean;
  };
  vectorDb: {
    provider: 'chroma' | 'pinecone' | 'weaviate' | 'pgvector';
    host: string;
    port: number;
    apiKey?: string;
    collection: string;
  };
  automation: {
    activePieces: {
      url: string;
      apiKey?: string;
      enabled: boolean;
    };
    triggerDev: {
      apiKey?: string;
      apiUrl?: string;
      enabled: boolean;
    };
  };
  analytics: {
    superset: {
      url: string;
      enabled: boolean;
    };
    grafana: {
      url: string;
      enabled: boolean;
    };
  };
  mcp: {
    servers: Array<{ name: string; url: string; enabled: boolean }>;
  };
  system: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableLocalLogging: boolean;
  };
  features: {
    [key: string]: boolean;
  };
  activePersonaId?: string;
}

const DEFAULT_CONFIG: AppConfig = {
  ai: {
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    embeddingModel: 'nomic-embed-text',
    chatModel: 'llama3',
    ingestion: {
      chunkSize: 2000,
      chunkOverlap: 200
    }
  },
  database: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'secondbrain',
    ssl: false
  },
  vectorDb: {
    provider: 'chroma',
    host: 'localhost',
    port: 8000,
    collection: 'embeddings'
  },
  automation: {
    activePieces: {
      url: 'http://localhost:8080',
      enabled: false
    },
    triggerDev: {
      apiUrl: 'https://api.trigger.dev',
      enabled: false
    }
  },
  analytics: {
    superset: {
      url: 'http://localhost:8088',
      enabled: false
    },
    grafana: {
      url: 'http://localhost:3000',
      enabled: false
    }
  },
  mcp: {
    servers: []
  },
  system: {
    logLevel: 'info',
    enableLocalLogging: true
  },
  features: {
    finance: true,
    health: true,
    knowledge: true
  }
};

export class ConfigManager {
  private configPath: string;
  private config: AppConfig;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    return DEFAULT_CONFIG;
  }

  saveConfig(newConfig: Partial<AppConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  getConfig(): AppConfig {
    return this.config;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
}
