import { test, expect, Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/login');
  }

  async clickForgotPasswordLink() {
    await this.page.click('a:has-text("Forgot Password")');
  }
}

class ForgotPasswordPage {
  constructor(private page: Page) {}

  async enterEmail(email: string) {
    await this.page.fill('input[type="email"]', email);
  }

  async clickResetButton() {
    await this.page.click('button:has-text("Reset Password")');
  }

  async getSuccessMessage() {
    return await this.page.textContent('.success-message');
  }
}

class ResetPasswordPage {
  constructor(private page: Page) {}

  async navigate(resetToken: string) {
    await this.page.goto(`/reset-password?token=${resetToken}`);
  }

  async enterNewPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
  }

  async enterConfirmPassword(password: string) {
    await this.page.fill('input[name="confirmPassword"]', password);
  }

  async clickSubmitButton() {
    await this.page.click('button:has-text("Submit")');
  }

  async getSuccessMessage() {
    return await this.page.textContent('.success-message');
  }
}

test('User can reset password via email link', async ({ page, context }) => {
  const testEmail = 'testuser@example.com';
  const newPassword = 'NewSecurePassword123!';
  const resetToken = 'test-reset-token-12345';

  // Step 1: Navigate to login and click forgot password
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.clickForgotPasswordLink();

  // Step 2: Submit email for password reset
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await forgotPasswordPage.enterEmail(testEmail);
  await forgotPasswordPage.clickResetButton();

  const successMessage = await forgotPasswordPage.getSuccessMessage();
  expect(successMessage).toContain('Check your email');

  // Step 3: Simulate clicking email link and navigate to reset password page
  const resetPasswordPage = new ResetPasswordPage(page);
  await resetPasswordPage.navigate(resetToken);

  // Step 4: Enter new password and confirm
  await resetPasswordPage.enterNewPassword(newPassword);
  await resetPasswordPage.enterConfirmPassword(newPassword);
  await resetPasswordPage.clickSubmitButton();

  // Step 5: Verify success message
  const resetSuccessMessage = await resetPasswordPage.getSuccessMessage();
  expect(resetSuccessMessage).toContain('Password reset successfully');

  // Step 6: Verify user can login with new password
  await page.goto('/login');
  const finalLoginPage = new LoginPage(page);
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', newPassword);
  await page.click('button:has-text("Login")');

  await expect(page).toHaveURL('/dashboard');
});