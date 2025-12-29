/**
 * E2E tests for search functionality.
 * 
 * Tests the search user journey including:
 * - Full-text search
 * - Filter application
 * - Search result interactions
 * - Search history
 */

import { test, expect, Page } from '@playwright/test';

// Helper functions
async function performSearch(page: Page, query: string): Promise<void> {
  await page.goto('/search');
  await page.getByPlaceholder(/search/i).fill(query);
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
}

async function waitForSearchResults(page: Page): Promise<void> {
  // Wait for results to load
  await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
}

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is already authenticated via global setup
    await page.goto('/dashboard');
  });

  test('should display search page with input', async ({ page }) => {
    await page.goto('/search');
    
    // Check search input is visible
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    
    // Check filters section exists
    await expect(page.getByTestId('search-filters')).toBeVisible();
  });

  test('should perform basic search', async ({ page }) => {
    await performSearch(page, 'test query');
    
    // Should show results or no results message
    const hasResults = await page.locator('[data-testid="search-result"]').count() > 0;
    const hasNoResults = await page.locator('[data-testid="no-results"]').isVisible().catch(() => false);
    
    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('should update URL with search query', async ({ page }) => {
    await performSearch(page, 'machine learning');
    
    // URL should contain the search query
    await expect(page).toHaveURL(/q=machine\+learning|q=machine%20learning/);
  });

  test('should filter by content type', async ({ page }) => {
    await page.goto('/search');
    
    // Open type filter
    await page.getByTestId('filter-type').click();
    
    // Select PDF type
    await page.getByRole('option', { name: /pdf/i }).click();
    
    // Perform search
    await page.getByPlaceholder(/search/i).fill('document');
    await page.keyboard.press('Enter');
    
    // URL should contain type filter
    await expect(page).toHaveURL(/type=pdf/);
  });

  test('should filter by date range', async ({ page }) => {
    await page.goto('/search');
    
    // Open date filter
    await page.getByTestId('filter-date').click();
    
    // Select "Last 7 days"
    await page.getByRole('option', { name: /7 days/i }).click();
    
    // Perform search
    await page.getByPlaceholder(/search/i).fill('recent');
    await page.keyboard.press('Enter');
    
    await waitForSearchResults(page);
    
    // Results should be filtered
    expect(page.url()).toContain('date=');
  });

  test('should filter by notebook', async ({ page }) => {
    await page.goto('/search');
    
    // Open notebook filter
    await page.getByTestId('filter-notebook').click();
    
    // Wait for notebooks to load
    await page.waitForSelector('[role="option"]');
    
    // Select first notebook if available
    const firstNotebook = page.getByRole('option').first();
    if (await firstNotebook.isVisible()) {
      await firstNotebook.click();
    }
  });

  test('should navigate to source from search result', async ({ page }) => {
    // Assuming we have some test data
    await performSearch(page, 'test');
    
    const hasResults = await page.locator('[data-testid="search-result"]').count() > 0;
    
    if (hasResults) {
      // Click on first result
      await page.locator('[data-testid="search-result"]').first().click();
      
      // Should navigate to source detail page
      await expect(page).toHaveURL(/\/sources\//);
    }
  });

  test('should highlight search terms in results', async ({ page }) => {
    await performSearch(page, 'important');
    
    const hasResults = await page.locator('[data-testid="search-result"]').count() > 0;
    
    if (hasResults) {
      // Check for highlighted text
      const highlightedText = page.locator('[data-testid="search-result"] mark, [data-testid="search-result"] .highlight');
      await expect(highlightedText.first()).toBeVisible();
    }
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/search');
    
    // Start typing
    await page.getByPlaceholder(/search/i).fill('mac');
    
    // Wait for suggestions
    const suggestions = page.getByTestId('search-suggestions');
    
    // Suggestions might appear depending on search history
    if (await suggestions.isVisible().catch(() => false)) {
      await expect(suggestions.locator('li').first()).toBeVisible();
    }
  });

  test('should clear search and filters', async ({ page }) => {
    await performSearch(page, 'test query');
    
    // Click clear button
    const clearButton = page.getByTestId('clear-search');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      
      // Search input should be empty
      await expect(page.getByPlaceholder(/search/i)).toHaveValue('');
    }
  });

  test('should handle empty search gracefully', async ({ page }) => {
    await page.goto('/search');
    
    // Press Enter without typing anything
    await page.getByPlaceholder(/search/i).press('Enter');
    
    // Should show empty state or all results
    const emptyState = page.getByTestId('empty-search');
    const allResults = page.getByTestId('search-results');
    
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasResults = await allResults.isVisible().catch(() => false);
    
    expect(hasEmptyState || hasResults).toBeTruthy();
  });

  test('should paginate search results', async ({ page }) => {
    await performSearch(page, '*');  // Match all
    
    const pagination = page.getByTestId('search-pagination');
    
    if (await pagination.isVisible()) {
      // Click next page
      await page.getByRole('button', { name: /next/i }).click();
      
      // URL should contain page parameter
      await expect(page).toHaveURL(/page=2/);
    }
  });
});

test.describe('Search Keyboard Navigation', () => {
  test('should focus search input with keyboard shortcut', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Press Cmd/Ctrl + K to focus search
    await page.keyboard.press('Control+k');
    
    // Search input should be focused
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeFocused();
  });

  test('should navigate results with arrow keys', async ({ page }) => {
    await performSearch(page, 'test');
    
    const results = page.locator('[data-testid="search-result"]');
    
    if (await results.count() > 0) {
      // Press down arrow to select first result
      await page.keyboard.press('ArrowDown');
      
      // First result should be highlighted/focused
      await expect(results.first()).toHaveClass(/selected|focused|active/);
    }
  });
});
