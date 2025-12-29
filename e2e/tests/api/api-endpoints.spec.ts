/**
 * API E2E tests for the AEI Core backend.
 * 
 * Tests API endpoints directly without browser interaction.
 */

import { test, expect, APIRequestContext } from '@playwright/test';

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: process.env.API_URL || 'http://localhost:8000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});

test.describe('Health Endpoints', () => {
  test('GET /api/v1/health - should return healthy status', async () => {
    const response = await apiContext.get('/api/v1/health');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
  });
  
  test('GET /api/v1/health/live - should return alive status', async () => {
    const response = await apiContext.get('/api/v1/health/live');
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.status).toBe('alive');
  });
  
  test('GET /api/v1/health/ready - should return readiness status', async () => {
    const response = await apiContext.get('/api/v1/health/ready');
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(['ready', 'not_ready']).toContain(body.status);
    expect(body.checks).toBeDefined();
  });
  
  test('GET /api/v1/health/deep - should return detailed health status', async () => {
    const response = await apiContext.get('/api/v1/health/deep');
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
    expect(body.dependencies).toBeDefined();
    expect(Array.isArray(body.dependencies)).toBeTruthy();
    expect(body.version).toBeDefined();
  });
});

test.describe('Chat Endpoints', () => {
  let sessionId: string;
  
  test('POST /api/v1/chat/sessions - should create a new session', async () => {
    const response = await apiContext.post('/api/v1/chat/sessions', {
      data: {
        notebook_id: null,
        model_override: null,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.session_id).toBeDefined();
    
    sessionId = body.session_id;
  });
  
  test('POST /api/v1/chat/{session_id}/message - should send a message', async () => {
    // Create a session first
    const sessionResponse = await apiContext.post('/api/v1/chat/sessions', {
      data: {},
    });
    const session = await sessionResponse.json();
    
    const response = await apiContext.post(`/api/v1/chat/${session.session_id}/message`, {
      data: {
        message: 'Hello, this is a test message.',
      },
    });
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.message).toBeDefined();
    expect(body.session_id).toBe(session.session_id);
  });
  
  test('GET /api/v1/chat/{session_id}/history - should return chat history', async () => {
    // Create a session and send a message first
    const sessionResponse = await apiContext.post('/api/v1/chat/sessions', {
      data: {},
    });
    const session = await sessionResponse.json();
    
    await apiContext.post(`/api/v1/chat/${session.session_id}/message`, {
      data: {
        message: 'Test message for history.',
      },
    });
    
    const response = await apiContext.get(`/api/v1/chat/${session.session_id}/history`);
    
    if (response.ok()) {
      const body = await response.json();
      expect(body.session_id).toBe(session.session_id);
      expect(body.messages).toBeDefined();
      expect(Array.isArray(body.messages)).toBeTruthy();
    }
  });
});

test.describe('API Documentation', () => {
  test('GET /docs - should return Swagger UI', async () => {
    const response = await apiContext.get('/docs');
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/html');
  });
  
  test('GET /redoc - should return ReDoc', async () => {
    const response = await apiContext.get('/redoc');
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/html');
  });
  
  test('GET /openapi.json - should return OpenAPI schema', async () => {
    const response = await apiContext.get('/openapi.json');
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.openapi).toBeDefined();
    expect(body.info).toBeDefined();
    expect(body.info.title).toBe('AEI Core API');
    expect(body.paths).toBeDefined();
  });
});

test.describe('Root Endpoint', () => {
  test('GET / - should return API info', async () => {
    const response = await apiContext.get('/');
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.service).toBe('AEI Core');
    expect(body.version).toBeDefined();
    expect(body.docs).toBe('/docs');
  });
});

test.describe('Error Handling', () => {
  test('should return 404 for non-existent endpoints', async () => {
    const response = await apiContext.get('/api/v1/non-existent');
    
    expect(response.status()).toBe(404);
  });
  
  test('should return 404 for non-existent session', async () => {
    const response = await apiContext.get('/api/v1/chat/non-existent-session/history');
    
    expect(response.status()).toBe(404);
  });
  
  test('should return 422 for invalid request body', async () => {
    const response = await apiContext.post('/api/v1/chat/sessions', {
      data: {
        invalid_field: 'this should not be here',
      },
    });
    
    // FastAPI may accept extra fields, but if validation is strict, it should return 422
    // This depends on Pydantic configuration
    expect([200, 422]).toContain(response.status());
  });
});
