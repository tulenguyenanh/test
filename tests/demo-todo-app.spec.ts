// tests/e2e/filter.spec.js
import { test, expect } from "@playwright/test";

test.describe("Product Filter Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("http://localhost:3000");

    // Wait for the page to load and products to be displayed
    await expect(page.locator('[data-testid="products-table"]')).toBeVisible();
  });

  test("should show and hide filter panel", async ({ page }) => {
    // Initially filter panel should not be visible
    await expect(
      page.locator('[data-testid="filter-panel"]')
    ).not.toBeVisible();

    // Click show filters button
    await page.click('button:has-text("Show Filters")');

    // Filter panel should now be visible
    await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();

    // Click hide filters button
    await page.click('button:has-text("Hide Filters")');

    // Filter panel should be hidden again
    await expect(
      page.locator('[data-testid="filter-panel"]')
    ).not.toBeVisible();
  });

  test("should filter products by search term", async ({ page }) => {
    // Get initial product count
    const initialRows = await page
      .locator('[data-testid="product-row"]')
      .count();
    expect(initialRows).toBeGreaterThan(0);

    // Search for a specific term
    await page.fill('[data-testid="search-input"]', "Apple");

    // Wait for search results to update
    await page.waitForTimeout(500);

    // Check that results are filtered (should be fewer rows or show "No products found")
    const filteredRows = await page
      .locator('[data-testid="product-row"]')
      .count();
    const noResultsMessage = await page
      .locator("text=No products found")
      .isVisible();

    // Either we have filtered results or no results message
    expect(filteredRows < initialRows || noResultsMessage).toBeTruthy();
  });

  test("should filter products using filter panel", async ({ page }) => {
    // Show filter panel
    await page.click('button:has-text("Show Filters")');
    await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();

    // Get initial product count
    const initialRows = await page
      .locator('[data-testid="product-row"]')
      .count();

    // Apply a brand filter
    await page.fill('[data-testid="brand-filter"]', "Apple");

    // Wait for results to update
    await page.waitForTimeout(500);

    // Check that results are filtered
    const filteredRows = await page
      .locator('[data-testid="product-row"]')
      .count();
    const noResultsMessage = await page
      .locator("text=No products found")
      .isVisible();

    expect(filteredRows <= initialRows).toBeTruthy();

    // If there are results, verify they contain the filter term
    if (filteredRows > 0) {
      const firstProductBrand = await page
        .locator('[data-testid="product-row"]')
        .first()
        .locator("text=Apple")
        .isVisible();
      expect(firstProductBrand).toBeTruthy();
    }
  });

  test("should clear all filters", async ({ page }) => {
    // Apply some filters first
    await page.fill('[data-testid="search-input"]', "Apple");
    await page.click('button:has-text("Show Filters")');
    await page.fill('[data-testid="brand-filter"]', "Samsung");

    // Wait for filters to apply
    await page.waitForTimeout(500);

    // Clear all filters
    await page.click('button:has-text("Clear All Filters")');

    // Wait for results to update
    await page.waitForTimeout(500);

    // Check that search input is cleared
    const searchValue = await page.inputValue('[data-testid="search-input"]');
    expect(searchValue).toBe("");

    // Check that brand filter is cleared
    const brandValue = await page.inputValue('[data-testid="brand-filter"]');
    expect(brandValue).toBe("");

    // Should show products again (not empty state)
    const rows = await page.locator('[data-testid="product-row"]').count();
    expect(rows).toBeGreaterThan(0);
  });

  test("should save and load filter", async ({ page }) => {
    // Apply a filter
    await page.fill('[data-testid="search-input"]', "iPhone");

    // Save the filter
    await page.click('button:has-text("Save Filter")');

    // Fill in filter name in the modal
    await page.fill('input[placeholder="Filter name..."]', "iPhone Products");
    await page.click('button:has-text("Save")');

    // Clear current filters
    await page.click('button:has-text("Clear All Filters")');

    // Verify filters are cleared
    const searchValue = await page.inputValue('[data-testid="search-input"]');
    expect(searchValue).toBe("");

    // Load the saved filter
    await page.click('button:has-text("iPhone Products")');

    // Wait for filter to load
    await page.waitForTimeout(500);

    // Verify the filter was loaded
    const loadedSearchValue = await page.inputValue(
      '[data-testid="search-input"]'
    );
    expect(loadedSearchValue).toBe("iPhone");
  });

  test("should show filter tags for active filters", async ({ page }) => {
    // Apply filters
    await page.fill('[data-testid="search-input"]', "Apple");
    await page.click('button:has-text("Show Filters")');
    await page.fill('[data-testid="brand-filter"]', "Apple");

    // Wait for filters to apply
    await page.waitForTimeout(500);

    // Check for filter tags
    await expect(page.locator('[data-testid="filter-tags"]')).toBeVisible();

    // Should show at least one active filter tag
    const filterTags = await page.locator('[data-testid="filter-tag"]').count();
    expect(filterTags).toBeGreaterThan(0);
  });

  test("should handle pagination with filters", async ({ page }) => {
    // Apply a broad filter that will likely return multiple pages
    await page.fill('[data-testid="search-input"]', "a");

    // Wait for results
    await page.waitForTimeout(500);

    // Check if pagination is visible (only if there are multiple pages)
    const nextButton = page.locator('button:has-text("Next")');
    const isNextButtonVisible = await nextButton.isVisible();

    if (isNextButtonVisible && !(await nextButton.isDisabled())) {
      // Click next page
      await nextButton.click();

      // Wait for page to load
      await page.waitForTimeout(500);

      // Verify we're on page 2
      await expect(page.locator("text=Page 2")).toBeVisible();

      // Verify filter is still applied
      const searchValue = await page.inputValue('[data-testid="search-input"]');
      expect(searchValue).toBe("a");
    }
  });
});
