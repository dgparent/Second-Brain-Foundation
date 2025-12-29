/**
 * Global setup for Playwright tests.
 * 
 * Runs once before all test files:
 * - Sets up test database
 * - Seeds required test data
 * - Configures authentication tokens
 */

import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Running global setup...');
  
  const apiUrl = process.env.API_URL || 'http://localhost:8000';
  
  // Wait for API to be ready
  let retries = 30;
  while (retries > 0) {
    try {
      const response = await fetch(`${apiUrl}/api/v1/health`);
      if (response.ok) {
        console.log('✅ API is ready');
        break;
      }
    } catch (e) {
      // API not ready yet
    }
    retries--;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (retries === 0) {
    throw new Error('API failed to start within timeout');
  }
  
  // Set up test authentication
  process.env.TEST_AUTH_TOKEN = 'test-token-for-e2e';
  
  // Create test data if needed
  try {
    // Create a test notebook for e2e tests
    const notebookResponse = await fetch(`${apiUrl}/api/v1/notebooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        name: 'E2E Test Notebook',
        description: 'Notebook for automated e2e testing',
      }),
    });
    
    if (notebookResponse.ok) {
      const notebook = await notebookResponse.json();
      process.env.TEST_NOTEBOOK_ID = notebook.id;
      console.log('✅ Test notebook created:', notebook.id);
    }
  } catch (e) {
    console.log('ℹ️ Could not create test notebook (may already exist)');
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
