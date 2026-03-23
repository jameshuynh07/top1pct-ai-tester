import { test, expect, Page } from '@playwright/test';

test.describe('Car Search by Location and Date', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('https://yomacarshare.com/search-cars', { waitUntil: 'networkidle' });
  });

  test('User can search for available cars by location and date', async () => {
    const testEmail = process.env.TEST_EMAIL || 'test+' + Date.now() + '@example.com';
    const testPassword = process.env.TEST_PASSWORD || 'TestPassword123!';

    // Login if required
    const loginButton = page.getByRole('button', { name: /sign in|login/i }).first();
    const isLoginVisible = await loginButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isLoginVisible) {
      await loginButton.click();
      
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await emailInput.fill(testEmail);
      await expect(emailInput).toHaveValue(testEmail);
      
      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toBeVisible({ timeout: 5000 });
      await passwordInput.fill(testPassword);
      await expect(passwordInput).toHaveValue(testPassword);
      
      const submitButton = page.getByRole('button', { name: /sign in|login|submit/i }).first();
      await expect(submitButton).toBeEnabled({ timeout: 5000 });
      await submitButton.click();
      
      // Wait for login to complete
      await page.waitForURL('**/search-cars', { timeout: 8000 }).catch(() => null);
      await page.waitForLoadState('networkidle');
    }

    // Fill location field
    const locationInput = page.getByLabel(/location|pickup location|where/i);
    await expect(locationInput).toBeVisible({ timeout: 5000 });
    await locationInput.fill('New York');
    await expect(locationInput).toHaveValue('New York');

    // Select location from dropdown if available
    const locationOption = page.getByRole('option', { name: /new york/i }).first();
    const isLocationOptionVisible = await locationOption.isVisible({ timeout: 3000 }).catch(() => false);
    if (isLocationOptionVisible) {
      await locationOption.click();
      await page.waitForLoadState('networkidle');
    }

    // Fill pickup date field
    const pickupDateInput = page.getByLabel(/pickup date|from date|start date/i);
    await expect(pickupDateInput).toBeVisible({ timeout: 5000 });
    await pickupDateInput.fill('12/20/2024');
    await expect(pickupDateInput).toHaveValue('12/20/2024');

    // Fill return date field
    const returnDateInput = page.getByLabel(/return date|to date|end date/i);
    await expect(returnDateInput).toBeVisible({ timeout: 5000 });
    await returnDateInput.fill('12/25/2024');
    await expect(returnDateInput).toHaveValue('12/25/2024');

    // Click search button
    const searchButton = page.getByRole('button', { name: /search|find cars|search cars/i }).first();
    await expect(searchButton).toBeVisible({ timeout: 5000 });
    await expect(searchButton).toBeEnabled({ timeout: 5000 });
    await searchButton.click();

    // Wait for search results to load
    await page.waitForLoadState('networkidle');
    
    // Verify search results are displayed
    const resultsContainer = page.getByTestId('search-results');
    const resultsHeading = page.getByText(/search results|cars found|available cars/i).first();
    const noResultsMessage = page.getByText(/no cars|no results|no available cars/i);
    const carListing = page.getByRole('heading', { name: /car|vehicle/i }).first();

    const hasResultsContainer = await resultsContainer.isVisible({ timeout: 5000 }).catch(() => false);
    const hasResultsHeading = await resultsHeading.isVisible({ timeout: 5000 }).catch(() => false);
    const hasNoResults = await noResultsMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasCarListing = await carListing.isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasResultsContainer || hasResultsHeading || hasNoResults || hasCarListing).toBeTruthy();

    // If results are available, verify car details are displayed
    const carItems = page.locator('[data-testid="car-item"]').or(page.locator('div:has-text("per day")'));
    const carItemCount = await carItems.count();
    
    if (carItemCount > 0) {
      // Verify first car item contains expected information
      const firstCarItem = carItems.first();
      await expect(firstCarItem).toBeVisible({ timeout: 5000 });
      
      // Check for car make/model or price information
      const carMakeModel = firstCarItem.getByText(/([A-Z][a-z]+ [A-Z][a-z]+|[0-9]{4})/);
      const carPrice = firstCarItem.getByText(/\$|per day|price/i);
      
      const hasMakeModel = await carMakeModel.isVisible({ timeout: 3000 }).catch(() => false);
      const hasPrice = await carPrice.isVisible({ timeout: 3000 }).catch(() => false);
      
      expect(hasMakeModel || hasPrice).toBeTruthy();
    } else {
      // Verify that no results message or empty state is displayed
      expect(hasNoResults || hasResultsContainer || hasResultsHeading).toBeTruthy();
    }
  });
});