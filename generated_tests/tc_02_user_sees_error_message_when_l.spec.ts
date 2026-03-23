import { test, expect, Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://practicetestautomation.com/practice-test-login/');
  }

  async enterUsername(username: string) {
    await this.page.fill('input[id="username"]', username);
  }

  async enterPassword(password: string) {
    await this.page.fill('input[id="password"]', password);
  }

  async clickSubmit() {
    await this.page.click('button[id="submit"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('#error');
  }

  async isErrorMessageVisible() {
    return await this.page.isVisible('#error');
  }
}

test('User sees error message when logging in with wrong password', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.enterUsername('student');
  await loginPage.enterPassword('wrongpassword');
  await loginPage.clickSubmit();

  const isErrorVisible = await loginPage.isErrorMessageVisible();
  expect(isErrorVisible).toBe(true);

  const errorMessage = await loginPage.getErrorMessage();
  expect(errorMessage).toContain('Your password is invalid!');
});