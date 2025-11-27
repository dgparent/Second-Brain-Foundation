import express, { Application, Request, Response } from 'express';
import axios from 'axios';
import { config } from 'dotenv';
import { logger } from '@sbf/logging';

config();

const app: Application = express();
const PORT = process.env.PORT || 3002;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '';
const TOGETHER_API_URL = 'https://api.together.xyz/v1';

app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'llm-orchestrator' });
});

// Model routing
interface ModelRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

app.post('/llm/chat', async (req: Request, res: Response) => {
  try {
    const { model, messages, temperature, max_tokens, stream }: ModelRequest = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;
    
    logger.info({ 
      event: 'llm_request', 
      tenantId, 
      model,
      messageCount: messages.length 
    });
    
    // Route to Together.ai
    const response = await axios.post(
      `${TOGETHER_API_URL}/chat/completions`,
      {
        model: model || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1024,
        stream: stream || false,
      },
      {
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // TODO: Track usage per tenant
    // TODO: Implement cost limits
    
    logger.info({ 
      event: 'llm_response', 
      tenantId, 
      model,
      tokensUsed: response.data.usage?.total_tokens 
    });
    
    res.json(response.data);
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ error: 'LLM request failed' });
  }
});

// Embeddings endpoint
app.post('/llm/embeddings', async (req: Request, res: Response) => {
  try {
    const { input, model } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;
    
    logger.info({ 
      event: 'embedding_request', 
      tenantId, 
      model 
    });
    
    const response = await axios.post(
      `${TOGETHER_API_URL}/embeddings`,
      {
        model: model || 'togethercomputer/m2-bert-80M-8k-retrieval',
        input,
      },
      {
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json(response.data);
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ error: 'Embedding request failed' });
  }
});

app.listen(PORT, () => {
  logger.info(`SBF LLM Orchestrator listening on port ${PORT}`);
});

export default app;
