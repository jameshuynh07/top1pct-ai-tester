import { test, expect, Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://example.com/login');
  }

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('input[type="password"]', password);
  }

  async clickLoginButton() {
    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async isLoggedIn() {
    await this.page.waitForURL('**/dashboard');
    return expect(this.page).toHaveURL(/.*dashboard/);
  }
}

test('User can log in with valid email and password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navigate();
  await loginPage.login('user@example.com', 'validPassword123');
  await loginPage.isLoggedIn();
});