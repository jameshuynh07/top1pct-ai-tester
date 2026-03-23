import { test, expect } from '@playwright/test';

class RegisterPage {
  constructor(private page) {}

  async navigate() {
    await this.page.goto('/register');
  }

  async fillEmail(email: string) {
    await this.page.fill('input[name="email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
  }

  async fillConfirmPassword(password: string) {
    await this.page.fill('input[name="confirmPassword"]', password);
  }

  async clickRegisterButton() {
    await this.page.click('button[type="submit"]');
  }

  async getSuccessMessage() {
    return await this.page.textContent('.success-message');
  }

  async getErrorMessage() {
    return await this.page.textContent('.error-message');
  }

  async isRegistrationSuccessful() {
    await this.page.waitForURL('/dashboard');
    return this.page.url().includes('/dashboard');
  }
}

test('User can register a new account with email and password', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  
  await registerPage.navigate();
  
  const testEmail = `user${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  
  await registerPage.fillEmail(testEmail);
  await registerPage.fillPassword(testPassword);
  await registerPage.fillConfirmPassword(testPassword);
  
  await registerPage.clickRegisterButton();
  
  const isSuccessful = await registerPage.isRegistrationSuccessful();
  expect(isSuccessful).toBeTruthy();
});