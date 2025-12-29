/**
 * E2E tests for notebook management flows.
 * 
 * Tests the complete user journey for:
 * - Creating notebooks
 * - Adding sources
 * - Chatting with content
 * - Searching notebooks
 */

import { test, expect, Page } from '@playwright/test';

// Test fixtures
interface NotebookTestFixtures {
  notebookId: string;
  notebookName: string;
}

// Helper functions
async function createNotebook(page: Page, name: string): Promise<string> {
  await page.getByTestId('create-notebook-button').click();
  await page.getByLabel('Notebook name').fill(name);
  await page.getByLabel('Description').fill('Test notebook for e2e testing');
  await page.getByRole('button', { name: 'Create' }).click();
  
  // Wait for redirect to notebook page
  await page.waitForURL(/\/notebooks\/[\w-]+/);
  const url = page.url();
  return url.split('/notebooks/')[1];
}

async function deleteNotebook(page: Page, notebookId: string): Promise<void> {
  await page.goto(`/notebooks/${notebookId}/settings`);
  await page.getByRole('button', { name: 'Delete notebook' }).click();
  await page.getByRole('button', { name: 'Confirm delete' }).click();
  await page.waitForURL('/notebooks');
}

test.describe('Notebook Management', () => {
  test.describe.configure({ mode: 'serial' });
  
  let testNotebookId: string;
  const testNotebookName = `E2E Test Notebook ${Date.now()}`;
  
  test.beforeAll(async ({ browser }) => {
    // Could set up shared state here
  });
  
  test.afterAll(async ({ browser }) => {
    // Clean up after all tests
    if (testNotebookId) {
      const page = await browser.newPage();
      try {
        await deleteNotebook(page, testNotebookId);
      } catch (e) {
        console.log('Could not clean up test notebook');
      }
      await page.close();
    }
  });
  
  test('should display notebooks list', async ({ page }) => {
    await page.goto('/notebooks');
    
    // Check page title
    await expect(page).toHaveTitle(/Notebooks/);
    
    // Check header is visible
    await expect(page.getByRole('heading', { name: 'Notebooks' })).toBeVisible();
    
    // Check create button is visible
    await expect(page.getByTestId('create-notebook-button')).toBeVisible();
  });
  
  test('should create a new notebook', async ({ page }) => {
    await page.goto('/notebooks');
    
    // Click create button
    await page.getByTestId('create-notebook-button').click();
    
    // Fill in notebook details
    await page.getByLabel('Notebook name').fill(testNotebookName);
    await page.getByLabel('Description').fill('A test notebook for e2e testing');
    
    // Select an icon (if available)
    const iconSelector = page.getByTestId('icon-selector');
    if (await iconSelector.isVisible()) {
      await iconSelector.click();
      await page.getByTestId('icon-book').click();
    }
    
    // Submit the form
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Should redirect to the new notebook
    await expect(page).toHaveURL(/\/notebooks\/[\w-]+/);
    
    // Save notebook ID for later tests
    testNotebookId = page.url().split('/notebooks/')[1];
    
    // Notebook name should be visible
    await expect(page.getByRole('heading', { name: testNotebookName })).toBeVisible();
  });
  
  test('should add a URL source to notebook', async ({ page }) => {
    test.skip(!testNotebookId, 'Requires notebook from previous test');
    
    await page.goto(`/notebooks/${testNotebookId}`);
    
    // Click add source button
    await page.getByTestId('add-source-button').click();
    
    // Select URL source type
    await page.getByRole('tab', { name: 'URL' }).click();
    
    // Enter URL
    const testUrl = 'https://example.com/article';
    await page.getByLabel('URL').fill(testUrl);
    
    // Submit
    await page.getByRole('button', { name: 'Add source' }).click();
    
    // Wait for source to be processed
    await expect(page.getByText('Source added')).toBeVisible({ timeout: 30000 });
    
    // Source should appear in the list
    await expect(page.getByTestId('source-list')).toContainText('example.com');
  });
  
  test('should upload a file source', async ({ page }) => {
    test.skip(!testNotebookId, 'Requires notebook from previous test');
    
    await page.goto(`/notebooks/${testNotebookId}`);
    
    // Click add source button
    await page.getByTestId('add-source-button').click();
    
    // Select file upload tab
    await page.getByRole('tab', { name: 'File' }).click();
    
    // Upload a test file
    const fileInput = page.getByTestId('file-upload-input');
    await fileInput.setInputFiles({
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a test document for e2e testing.'),
    });
    
    // Submit
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for upload to complete
    await expect(page.getByText('File uploaded')).toBeVisible({ timeout: 30000 });
  });
  
  test('should start a chat session', async ({ page }) => {
    test.skip(!testNotebookId, 'Requires notebook from previous test');
    
    await page.goto(`/notebooks/${testNotebookId}`);
    
    // Click on chat tab
    await page.getByRole('tab', { name: 'Chat' }).click();
    
    // Chat input should be visible
    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();
    
    // Send a test message
    await chatInput.fill('What is this notebook about?');
    await page.getByTestId('send-message-button').click();
    
    // User message should appear
    await expect(page.getByTestId('chat-message-user')).toContainText('What is this notebook about?');
    
    // Wait for AI response (streaming)
    await expect(page.getByTestId('chat-message-assistant')).toBeVisible({ timeout: 60000 });
    
    // Response should have content
    const assistantMessage = page.getByTestId('chat-message-assistant').first();
    await expect(assistantMessage).not.toBeEmpty();
  });
  
  test('should search within notebook', async ({ page }) => {
    test.skip(!testNotebookId, 'Requires notebook from previous test');
    
    await page.goto(`/notebooks/${testNotebookId}`);
    
    // Click on search tab
    await page.getByRole('tab', { name: 'Search' }).click();
    
    // Search input should be visible
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    
    // Perform a search
    await searchInput.fill('test');
    await page.keyboard.press('Enter');
    
    // Results should appear
    await expect(page.getByTestId('search-results')).toBeVisible({ timeout: 10000 });
  });
  
  test('should edit notebook settings', async ({ page }) => {
    test.skip(!testNotebookId, 'Requires notebook from previous test');
    
    await page.goto(`/notebooks/${testNotebookId}/settings`);
    
    // Change notebook name
    const newName = `Updated ${testNotebookName}`;
    await page.getByLabel('Notebook name').fill(newName);
    
    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Success message should appear
    await expect(page.getByText('Settings saved')).toBeVisible();
    
    // Navigate back and verify name changed
    await page.goto(`/notebooks/${testNotebookId}`);
    await expect(page.getByRole('heading', { name: newName })).toBeVisible();
  });
  
  test('should delete notebook', async ({ page }) => {
    test.skip(!testNotebookId, 'Requires notebook from previous test');
    
    await page.goto(`/notebooks/${testNotebookId}/settings`);
    
    // Click delete button
    await page.getByRole('button', { name: 'Delete notebook' }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm delete' }).click();
    
    // Should redirect to notebooks list
    await expect(page).toHaveURL('/notebooks');
    
    // Notebook should no longer appear
    await expect(page.getByText(testNotebookName)).not.toBeVisible();
    
    // Mark as cleaned up
    testNotebookId = '';
  });
});

test.describe('Chat Flow', () => {
  test('should handle streaming responses', async ({ page }) => {
    await page.goto('/');
    
    // Start a new chat
    await page.getByTestId('new-chat-button').click();
    
    // Send a message
    const chatInput = page.getByTestId('chat-input');
    await chatInput.fill('Tell me a short story.');
    await page.getByTestId('send-message-button').click();
    
    // Watch for streaming indicator
    await expect(page.getByTestId('streaming-indicator')).toBeVisible();
    
    // Wait for response to complete
    await expect(page.getByTestId('streaming-indicator')).not.toBeVisible({ timeout: 60000 });
    
    // Response should be present
    await expect(page.getByTestId('chat-message-assistant')).toBeVisible();
  });
  
  test('should maintain conversation history', async ({ page }) => {
    await page.goto('/');
    
    // Start a new chat
    await page.getByTestId('new-chat-button').click();
    
    // Send first message
    const chatInput = page.getByTestId('chat-input');
    await chatInput.fill('My name is Test User.');
    await page.getByTestId('send-message-button').click();
    
    // Wait for response
    await expect(page.getByTestId('chat-message-assistant')).toBeVisible({ timeout: 60000 });
    
    // Send follow-up message
    await chatInput.fill('What is my name?');
    await page.getByTestId('send-message-button').click();
    
    // Wait for response that should reference the name
    const assistantMessages = page.getByTestId('chat-message-assistant');
    await expect(assistantMessages.last()).toContainText(/Test User/i, { timeout: 60000 });
  });
});

test.describe('Search Flow', () => {
  test('should perform global search', async ({ page }) => {
    await page.goto('/search');
    
    // Search input should be focused
    const searchInput = page.getByTestId('global-search-input');
    await expect(searchInput).toBeFocused();
    
    // Perform search
    await searchInput.fill('test query');
    await page.keyboard.press('Enter');
    
    // Loading state
    await expect(page.getByTestId('search-loading')).toBeVisible();
    
    // Results should load
    await expect(page.getByTestId('search-results')).toBeVisible({ timeout: 10000 });
  });
  
  test('should filter search results', async ({ page }) => {
    await page.goto('/search');
    
    // Perform search
    const searchInput = page.getByTestId('global-search-input');
    await searchInput.fill('content');
    await page.keyboard.press('Enter');
    
    // Wait for results
    await expect(page.getByTestId('search-results')).toBeVisible({ timeout: 10000 });
    
    // Apply filter
    await page.getByTestId('filter-source-type').click();
    await page.getByRole('option', { name: 'Articles' }).click();
    
    // Results should update
    await expect(page.getByTestId('search-loading')).toBeVisible();
    await expect(page.getByTestId('search-results')).toBeVisible({ timeout: 10000 });
  });
});
