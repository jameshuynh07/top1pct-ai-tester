import { test, expect, Page } from '@playwright/test';

class HomePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://example.com');
  }

  async getCarsContainer() {
    return this.page.locator('[data-testid="cars-container"]');
  }

  async getCarCards() {
    return this.page.locator('[data-testid="car-card"]');
  }

  async getCarTitle(index: number) {
    return this.page.locator(`[data-testid="car-card"]`).nth(index).locator('[data-testid="car-title"]');
  }

  async getCarPrice(index: number) {
    return this.page.locator(`[data-testid="car-card"]`).nth(index).locator('[data-testid="car-price"]');
  }

  async getCarImage(index: number) {
    return this.page.locator(`[data-testid="car-card"]`).nth(index).locator('[data-testid="car-image"]');
  }

  async clickCarCard(index: number) {
    await this.page.locator(`[data-testid="car-card"]`).nth(index).click();
  }
}

test('User can browse available cars on the home page', async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();

  // Verify cars container is visible
  const carsContainer = await homePage.getCarsContainer();
  await expect(carsContainer).toBeVisible();

  // Get all car cards
  const carCards = await homePage.getCarCards();
  const carCount = await carCards.count();

  // Verify at least one car is available
  expect(carCount).toBeGreaterThan(0);

  // Verify first car has required information
  const firstCarTitle = await homePage.getCarTitle(0);
  const firstCarPrice = await homePage.getCarPrice(0);
  const firstCarImage = await homePage.getCarImage(0);

  await expect(firstCarTitle).toBeVisible();
  await expect(firstCarPrice).toBeVisible();
  await expect(firstCarImage).toBeVisible();

  // Verify car title has text
  const titleText = await firstCarTitle.textContent();
  expect(titleText).toBeTruthy();

  // Verify car price has text
  const priceText = await firstCarPrice.textContent();
  expect(priceText).toBeTruthy();

  // Verify car image has src attribute
  const imageSrc = await firstCarImage.getAttribute('src');
  expect(imageSrc).toBeTruthy();

  // Verify car card is clickable
  const firstCarCard = await homePage.getCarCards().nth(0);
  await expect(firstCarCard).toBeEnabled();
});