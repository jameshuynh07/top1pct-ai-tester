import { test, expect, Page } from '@playwright/test';

test.describe('Password Reset via Email', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('https://yomacarshare.com/forgot-password', { waitUntil: 'networkidle' });
  });

  test('User can reset password via email link', async () => {
    const testEmail = process.env.TEST_EMAIL || 'test+' + Date.now() + '@example.com';
    const testPassword = process.env.TEST_PASSWORD || 'NewPassword123!';

    // Fill email field
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    await expect(emailInput).toHaveValue(testEmail);

    // Click send reset link button
    const sendButton = page.getByRole('button', { name: /send|submit|reset/i }).first();
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    await expect(sendButton).toBeEnabled({ timeout: 5000 });
    await sendButton.click();

    // Wait for confirmation message
    const confirmationMessage = page.getByText(/link sent|check your email|verification email|password reset|email sent/i).first();
    await expect(confirmationMessage).toBeVisible({ timeout: 8000 });

    // Simulate clicking the reset link (in a real scenario, this would come from email)
    // For testing purposes, we'll navigate directly to a reset token URL
    const resetTokenUrl = 'https://yomacarshare.com/reset-password?token=test-reset-token';
    await page.goto(resetTokenUrl, { waitUntil: 'networkidle' });

    // Fill new password field
    const newPasswordInput = page.getByLabel(/new password/i);
    await expect(newPasswordInput).toBeVisible({ timeout: 5000 });
    await newPasswordInput.fill(testPassword);
    await expect(newPasswordInput).toHaveValue(testPassword);

    // Fill confirm password field
    const confirmPasswordInput = page.getByLabel(/confirm password|verify password/i);
    await expect(confirmPasswordInput).toBeVisible({ timeout: 5000 });
    await confirmPasswordInput.fill(testPassword);
    await expect(confirmPasswordInput).toHaveValue(testPassword);

    // Click reset password button
    const resetButton = page.getByRole('button', { name: /reset|update|confirm/i }).first();
    await expect(resetButton).toBeVisible({ timeout: 5000 });
    await expect(resetButton).toBeEnabled({ timeout: 5000 });
    await resetButton.click();

    // Wait for success message or redirect to login
    const urlChangePromise = page.waitForURL(/^\w+:\/\/[^\/]+(\/login|\/signin)/, { timeout: 8000 }).catch(() => null);
    const successMessagePromise = page.getByText(/password reset|successfully updated|password changed|reset successful/i).first().waitFor({ timeout: 8000 }).catch(() => null);

    const urlChanged = await urlChangePromise;
    const successMessageFound = await successMessagePromise;

    // Verify password reset was successful
    expect(urlChanged !== null || successMessageFound !== null).toBeTruthy();

    // If redirected to login, verify we can see the login form
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('login') || currentUrl.includes('signin');

    if (isRedirectedToLogin) {
      const loginEmailInput = page.getByLabel(/email/i);
      await expect(loginEmailInput).toBeVisible({ timeout: 5000 });
    } else if (successMessageFound !== null) {
      const successMessage = page.getByText(/password reset|successfully updated|password changed|reset successful/i).first();
      await expect(successMessage).toBeVisible();
    }
  });
});