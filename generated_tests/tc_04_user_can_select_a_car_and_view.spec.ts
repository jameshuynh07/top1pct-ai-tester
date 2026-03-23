import { test, expect, Page } from '@playwright/test';

class CarListingPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://example.com/cars');
  }

  async selectCar(carName: string) {
    await this.page.click(`text=${carName}`);
  }

  async getCarCount() {
    return await this.page.locator('[data-testid="car-item"]').count();
  }
}

class BookingDetailsPage {
  constructor(private page: Page) {}

  async getCarName() {
    return await this.page.locator('[data-testid="car-name"]').textContent();
  }

  async getPrice() {
    return await this.page.locator('[data-testid="car-price"]').textContent();
  }

  async getAvailabilityStatus() {
    return await this.page.locator('[data-testid="availability-status"]').textContent();
  }

  async isBookingButtonVisible() {
    return await this.page.locator('[data-testid="book-button"]').isVisible();
  }

  async clickBookButton() {
    await this.page.click('[data-testid="book-button"]');
  }
}

test('User can select a car and view its booking details', async ({ page }) => {
  const carListingPage = new CarListingPage(page);
  const bookingDetailsPage = new BookingDetailsPage(page);

  // Navigate to car listing page
  await carListingPage.navigate();

  // Verify cars are displayed
  const carCount = await carListingPage.getCarCount();
  expect(carCount).toBeGreaterThan(0);

  // Select a specific car
  await carListingPage.selectCar('Toyota Camry');

  // Wait for booking details page to load
  await page.waitForURL('**/booking/**');

  // Verify booking details are displayed
  const carName = await bookingDetailsPage.getCarName();
  expect(carName).toContain('Toyota Camry');

  // Verify price is displayed
  const price = await bookingDetailsPage.getPrice();
  expect(price).toBeTruthy();
  expect(price).toMatch(/\$\d+/);

  // Verify availability status
  const availabilityStatus = await bookingDetailsPage.getAvailabilityStatus();
  expect(availabilityStatus).toMatch(/Available|Unavailable/);

  // Verify booking button is visible
  const isBookingButtonVisible = await bookingDetailsPage.isBookingButtonVisible();
  expect(isBookingButtonVisible).toBe(true);
});