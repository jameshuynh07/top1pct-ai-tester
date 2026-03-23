import { test, expect, Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://example.com/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

class CarBookingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://example.com/cars');
  }

  async clickBookButton() {
    await this.page.click('button:has-text("Book Now")');
  }

  async getLoginPromptMessage() {
    return await this.page.textContent('.login-prompt-message');
  }

  async isLoginPromptVisible() {
    return await this.page.isVisible('.login-prompt-message');
  }
}

test('User cannot book a car if they are not logged in', async ({ page }) => {
  const carBookingPage = new CarBookingPage(page);

  // Navigate to car booking page without logging in
  await carBookingPage.goto();

  // Attempt to click the book button
  await carBookingPage.clickBookButton();

  // Verify that login prompt is shown
  const isPromptVisible = await carBookingPage.isLoginPromptVisible();
  expect(isPromptVisible).toBe(true);

  // Verify the login prompt message
  const promptMessage = await carBookingPage.getLoginPromptMessage();
  expect(promptMessage).toContain('Please log in to book a car');
});