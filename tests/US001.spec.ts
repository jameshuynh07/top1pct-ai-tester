import { test, expect, Page } from '@playwright/test';

test.describe('User Registration', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('https://yomacarshare.com/register', { waitUntil: 'networkidle' });
  });

  test('User can register a new account with email and password', async () => {
    const testEmail = process.env.TEST_EMAIL || 'test+' + Date.now() + '@example.com';
    const testPassword = process.env.TEST_PASSWORD || 'TestPassword123!';

    // Fill email field
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    await expect(emailInput).toHaveValue(testEmail);

    // Fill password field
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill(testPassword);
    await expect(passwordInput).toHaveValue(testPassword);

    // Fill confirm password field if exists
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    const confirmPasswordVisible = await confirmPasswordInput.isVisible({ timeout: 2000 }).catch(() => false);
    if (confirmPasswordVisible) {
      await confirmPasswordInput.fill(testPassword);
      await expect(confirmPasswordInput).toHaveValue(testPassword);
    }

    // Click register button
    const registerButton = page.getByRole('button', { name: /register/i });
    await expect(registerButton).toBeVisible({ timeout: 5000 });
    await expect(registerButton).toBeEnabled({ timeout: 5000 });
    await registerButton.click();

    // Wait for navigation or success message with proper timeout handling
    const urlChangePromise = page.waitForURL(/^\w+:\/\/[^\/]+(\/login|\/dashboard|\/home|\/verify|\/confirmation)/, { timeout: 8000 }).catch(() => null);
    const successMessagePromise = page.getByText(/registration successful|account created|welcome|check your email/i).first().waitFor({ timeout: 8000 }).catch(() => null);

    const urlChanged = await urlChangePromise;
    const successMessageFound = await successMessagePromise;

    // Verify successful registration
    expect(urlChanged !== null || successMessageFound !== null).toBeTruthy();

    // Additional validation - ensure we're not on register page anymore or have success indicator
    if (urlChanged !== null) {
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/register');
    } else if (successMessageFound !== null) {
      const successMessage = page.getByText(/registration successful|account created|welcome|check your email/i).first();
      await expect(successMessage).toBeVisible();
    }
  });
});