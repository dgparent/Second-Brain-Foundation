/**
 * Global teardown for Playwright tests.
 * 
 * Runs once after all test files:
 * - Cleans up test data
 * - Closes connections
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');
  
  const apiUrl = process.env.API_URL || 'http://localhost:8000';
  
  // Clean up test data
  if (process.env.TEST_NOTEBOOK_ID) {
    try {
      await fetch(`${apiUrl}/api/v1/notebooks/${process.env.TEST_NOTEBOOK_ID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
      });
      console.log('✅ Test notebook cleaned up');
    } catch (e) {
      console.log('ℹ️ Could not clean up test notebook');
    }
  }
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
