import { test, expect } from '@playwright/test';

class CarsPage {
  constructor(private page: any) {}

  async navigateToCarsPage() {
    await this.page.goto('/cars');
  }

  async clickAddToFavouritesButton(carIndex: number = 0) {
    const addToFavouritesButtons = await this.page.locator('[data-testid="add-to-favourites-btn"]');
    await addToFavouritesButtons.nth(carIndex).click();
  }

  async getCarTitle(carIndex: number = 0) {
    const carTitles = await this.page.locator('[data-testid="car-title"]');
    return await carTitles.nth(carIndex).textContent();
  }

  async isFavouriteButtonActive(carIndex: number = 0) {
    const addToFavouritesButtons = await this.page.locator('[data-testid="add-to-favourites-btn"]');
    const button = addToFavouritesButtons.nth(carIndex);
    return await button.evaluate((el: HTMLElement) => el.classList.contains('active'));
  }

  async getFavouritesCount() {
    const badge = await this.page.locator('[data-testid="favourites-count"]');
    return await badge.textContent();
  }
}

test('User can add a car to favourites', async ({ page }) => {
  const carsPage = new CarsPage(page);

  await carsPage.navigateToCarsPage();

  const carTitle = await carsPage.getCarTitle(0);
  expect(carTitle).toBeTruthy();

  await carsPage.clickAddToFavouritesButton(0);

  const isActive = await carsPage.isFavouriteButtonActive(0);
  expect(isActive).toBe(true);

  const favouritesCount = await carsPage.getFavouritesCount();
  expect(favouritesCount).toBe('1');
});