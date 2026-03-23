import { test, expect } from '@playwright/test';

class CarDetailsPage {
  constructor(private page) {}

  async navigateToCarDetails(carId: string) {
    await this.page.goto(`/cars/${carId}`);
  }

  async getCarPrice(): Promise<string> {
    return await this.page.locator('[data-testid="car-price"]').textContent();
  }

  async getCarSpecs(): Promise<string[]> {
    const specs = await this.page.locator('[data-testid="car-specs"] li').allTextContents();
    return specs;
  }

  async getCarPhotos(): Promise<number> {
    const photos = await this.page.locator('[data-testid="car-photo"]');
    return await photos.count();
  }

  async isCarTitleVisible(): Promise<boolean> {
    return await this.page.locator('[data-testid="car-title"]').isVisible();
  }

  async getCarTitle(): Promise<string> {
    return await this.page.locator('[data-testid="car-title"]').textContent();
  }
}

test.describe('Car Details Page', () => {
  let carDetailsPage: CarDetailsPage;

  test.beforeEach(async ({ page }) => {
    carDetailsPage = new CarDetailsPage(page);
  });

  test('should display car price, specs and photos', async ({ page }) => {
    await carDetailsPage.navigateToCarDetails('12345');

    const carTitle = await carDetailsPage.getCarTitle();
    expect(carTitle).toBeTruthy();

    const price = await carDetailsPage.getCarPrice();
    expect(price).toMatch(/\$[\d,]+/);

    const specs = await carDetailsPage.getCarSpecs();
    expect(specs.length).toBeGreaterThan(0);
    expect(specs[0]).toBeTruthy();

    const photoCount = await carDetailsPage.getCarPhotos();
    expect(photoCount).toBeGreaterThan(0);

    const isTitleVisible = await carDetailsPage.isCarTitleVisible();
    expect(isTitleVisible).toBe(true);
  });
});