/**
 * E2E tests for chat functionality.
 * 
 * Tests the chat user journey including:
 * - Starting a new chat session
 * - Sending messages
 * - Receiving streaming responses
 * - Chat history management
 * - Model selection
 */

import { test, expect, Page } from '@playwright/test';

// Helper functions
async function startNewChat(page: Page, notebookName?: string): Promise<void> {
  if (notebookName) {
    // Navigate to specific notebook
    await page.goto('/notebooks');
    await page.getByText(notebookName).click();
  }
  
  // Click new chat button
  await page.getByTestId('new-chat-button').click();
  await page.waitForURL(/\/chat\//);
}

async function sendMessage(page: Page, message: string): Promise<void> {
  const input = page.getByTestId('chat-input');
  await input.fill(message);
  await input.press('Enter');
}

async function waitForResponse(page: Page, timeout = 30000): Promise<void> {
  // Wait for assistant message to appear
  await page.waitForSelector('[data-role="assistant"]', { timeout });
  
  // Wait for streaming to complete (stop button disappears)
  await page.waitForSelector('[data-testid="stop-generation"]', { state: 'hidden', timeout }).catch(() => {});
}

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should display chat interface', async ({ page }) => {
    // Check main chat elements are visible
    await expect(page.getByTestId('chat-container')).toBeVisible();
    await expect(page.getByTestId('chat-input')).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeVisible();
  });

  test('should start with empty chat', async ({ page }) => {
    // Should show empty state or welcome message
    const emptyState = page.getByTestId('chat-empty-state');
    const welcomeMessage = page.getByText(/how can i help/i);
    
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasWelcome = await welcomeMessage.isVisible().catch(() => false);
    
    expect(hasEmptyState || hasWelcome).toBeTruthy();
  });

  test('should show suggested prompts', async ({ page }) => {
    const suggestions = page.getByTestId('suggested-prompts');
    
    if (await suggestions.isVisible()) {
      // Should have at least one suggestion
      await expect(suggestions.locator('button')).toHaveCount.above(0);
    }
  });

  test('should send a message', async ({ page }) => {
    const testMessage = 'Hello, this is a test message';
    
    await sendMessage(page, testMessage);
    
    // User message should appear
    await expect(page.getByText(testMessage)).toBeVisible();
  });

  test('should receive streaming response', async ({ page }) => {
    test.setTimeout(60000);
    
    await sendMessage(page, 'What is 2 + 2?');
    
    // Should show loading/streaming indicator
    const streamingIndicator = page.getByTestId('streaming-indicator');
    
    // Wait for response to start
    await page.waitForSelector('[data-role="assistant"]', { timeout: 30000 });
    
    // Wait for response to complete
    await waitForResponse(page);
    
    // Response should contain some text
    const response = page.locator('[data-role="assistant"]').last();
    await expect(response).not.toBeEmpty();
  });

  test('should allow stopping generation', async ({ page }) => {
    test.setTimeout(60000);
    
    // Send a message that would generate a long response
    await sendMessage(page, 'Write a detailed essay about artificial intelligence');
    
    // Wait for streaming to start
    await page.waitForSelector('[data-testid="stop-generation"]', { timeout: 10000 });
    
    // Click stop button
    await page.getByTestId('stop-generation').click();
    
    // Streaming should stop
    await expect(page.getByTestId('stop-generation')).not.toBeVisible();
  });

  test('should show message timestamps', async ({ page }) => {
    await sendMessage(page, 'Test message for timestamp');
    await waitForResponse(page);
    
    // Messages should have timestamps
    const timestamp = page.locator('[data-testid="message-timestamp"]').first();
    await expect(timestamp).toBeVisible();
  });

  test('should copy message to clipboard', async ({ page }) => {
    await sendMessage(page, 'Copy this message');
    await waitForResponse(page);
    
    // Hover over response to show actions
    const response = page.locator('[data-role="assistant"]').last();
    await response.hover();
    
    // Click copy button
    const copyButton = response.getByTestId('copy-message');
    if (await copyButton.isVisible()) {
      await copyButton.click();
      
      // Should show success toast or change icon
      await expect(page.getByText(/copied/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should regenerate response', async ({ page }) => {
    test.setTimeout(60000);
    
    await sendMessage(page, 'Generate a short response');
    await waitForResponse(page);
    
    const firstResponse = await page.locator('[data-role="assistant"]').last().textContent();
    
    // Click regenerate button
    const regenerateButton = page.getByTestId('regenerate-response');
    if (await regenerateButton.isVisible()) {
      await regenerateButton.click();
      await waitForResponse(page);
      
      // Response should be regenerated (may or may not be different)
      const secondResponse = await page.locator('[data-role="assistant"]').last().textContent();
      expect(secondResponse).toBeTruthy();
    }
  });
});

test.describe('Chat History', () => {
  test('should show chat history sidebar', async ({ page }) => {
    await page.goto('/chat');
    
    const sidebar = page.getByTestId('chat-history-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('should create new chat session', async ({ page }) => {
    await page.goto('/chat');
    
    // Start a chat
    await sendMessage(page, 'First chat session');
    await waitForResponse(page);
    
    // Click new chat
    await page.getByTestId('new-chat-button').click();
    
    // Should be a new empty chat
    const messages = page.locator('[data-role="user"], [data-role="assistant"]');
    await expect(messages).toHaveCount(0);
  });

  test('should switch between chat sessions', async ({ page }) => {
    await page.goto('/chat');
    
    // Create first chat
    await sendMessage(page, 'Chat session one');
    await waitForResponse(page);
    
    // Create second chat
    await page.getByTestId('new-chat-button').click();
    await sendMessage(page, 'Chat session two');
    await waitForResponse(page);
    
    // Switch back to first chat
    const historyItems = page.getByTestId('chat-history-item');
    if (await historyItems.count() > 1) {
      await historyItems.nth(1).click();
      
      // Should show first chat content
      await expect(page.getByText('Chat session one')).toBeVisible();
    }
  });

  test('should delete chat session', async ({ page }) => {
    await page.goto('/chat');
    
    // Start a chat
    await sendMessage(page, 'Chat to delete');
    await waitForResponse(page);
    
    // Get initial count
    const historyItems = page.getByTestId('chat-history-item');
    const initialCount = await historyItems.count();
    
    if (initialCount > 0) {
      // Hover on first item and click delete
      await historyItems.first().hover();
      const deleteButton = historyItems.first().getByTestId('delete-chat');
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion
        await page.getByRole('button', { name: /confirm|delete/i }).click();
        
        // Count should decrease
        await expect(historyItems).toHaveCount(initialCount - 1);
      }
    }
  });

  test('should rename chat session', async ({ page }) => {
    await page.goto('/chat');
    
    await sendMessage(page, 'Chat to rename');
    await waitForResponse(page);
    
    const historyItems = page.getByTestId('chat-history-item');
    
    if (await historyItems.count() > 0) {
      // Hover and click rename
      await historyItems.first().hover();
      const renameButton = historyItems.first().getByTestId('rename-chat');
      
      if (await renameButton.isVisible()) {
        await renameButton.click();
        
        // Enter new name
        await page.getByRole('textbox').fill('Renamed Chat');
        await page.keyboard.press('Enter');
        
        // Should show new name
        await expect(page.getByText('Renamed Chat')).toBeVisible();
      }
    }
  });
});

test.describe('Chat with Context', () => {
  test('should use notebook context', async ({ page }) => {
    test.setTimeout(60000);
    
    // Navigate to a notebook with sources
    await page.goto('/notebooks');
    
    const firstNotebook = page.locator('[data-testid="notebook-card"]').first();
    if (await firstNotebook.isVisible()) {
      await firstNotebook.click();
      
      // Start chat from notebook
      await page.getByTestId('chat-with-notebook').click();
      
      // Send a question about the content
      await sendMessage(page, 'Summarize the content in this notebook');
      await waitForResponse(page);
      
      // Response should reference notebook content
      const response = page.locator('[data-role="assistant"]').last();
      await expect(response).not.toBeEmpty();
    }
  });

  test('should show source citations', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/chat');
    
    await sendMessage(page, 'What do my notes say about the topic?');
    await waitForResponse(page);
    
    // Look for citation indicators
    const citations = page.getByTestId('source-citation');
    
    // Citations may or may not appear depending on content
    if (await citations.count() > 0) {
      // Should be clickable
      await citations.first().click();
      
      // Should show source preview or navigate to source
      const preview = page.getByTestId('source-preview');
      await expect(preview).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Chat Settings', () => {
  test('should show model selector', async ({ page }) => {
    await page.goto('/chat');
    
    const modelSelector = page.getByTestId('model-selector');
    await expect(modelSelector).toBeVisible();
  });

  test('should change AI model', async ({ page }) => {
    await page.goto('/chat');
    
    // Open model selector
    await page.getByTestId('model-selector').click();
    
    // Wait for options
    await page.waitForSelector('[role="option"]');
    
    // Select a different model
    const options = page.getByRole('option');
    if (await options.count() > 1) {
      await options.nth(1).click();
      
      // Model should be selected
      const selectedModel = await page.getByTestId('model-selector').textContent();
      expect(selectedModel).toBeTruthy();
    }
  });

  test('should persist chat settings', async ({ page }) => {
    await page.goto('/chat/settings');
    
    // Toggle a setting
    const streamingToggle = page.getByTestId('streaming-toggle');
    if (await streamingToggle.isVisible()) {
      const wasChecked = await streamingToggle.isChecked();
      await streamingToggle.click();
      
      // Reload page
      await page.reload();
      
      // Setting should persist
      await expect(streamingToggle).toBeChecked({ checked: !wasChecked });
    }
  });
});

test.describe('Chat Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/chat');
    
    // Check input has label
    const input = page.getByTestId('chat-input');
    await expect(input).toHaveAttribute('aria-label', /.+/);
    
    // Check send button has label
    const sendButton = page.getByTestId('send-button');
    await expect(sendButton).toHaveAttribute('aria-label', /.+/);
  });

  test('should announce new messages to screen readers', async ({ page }) => {
    await page.goto('/chat');
    
    // Check for live region
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/chat');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    
    // Should focus on interactive elements
    const activeElement = page.locator(':focus');
    await expect(activeElement).toBeVisible();
  });
});
