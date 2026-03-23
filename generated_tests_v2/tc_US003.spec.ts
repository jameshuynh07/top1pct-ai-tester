import { test, expect } from '@playwright/test';

class CarSearchPage {
  constructor(private page) {}

  async navigate() {
    await this.page.goto('/');
  }

  async selectLocation(location: string) {
    await this.page.fill('[data-testid="location-input"]', location);
    await this.page.click(`[data-testid="location-option-${location}"]`);
  }

  async selectPickupDate(date: string) {
    await this.page.click('[data-testid="pickup-date-input"]');
    await this.page.click(`[data-testid="date-${date}"]`);
  }

  async selectReturnDate(date: string) {
    await this.page.click('[data-testid="return-date-input"]');
    await this.page.click(`[data-testid="date-${date}"]`);
  }

  async clickSearchButton() {
    await this.page.click('[data-testid="search-button"]');
  }

  async getSearchResults() {
    await this.page.waitForSelector('[data-testid="car-listing"]');
    return await this.page.locator('[data-testid="car-listing"]').count();
  }

  async getCarListings() {
    return await this.page.locator('[data-testid="car-listing"]').all();
  }

  async getNoResultsMessage() {
    return await this.page.locator('[data-testid="no-results-message"]').textContent();
  }
}

test.describe('Car Search Functionality', () => {
  let carSearchPage: CarSearchPage;

  test.beforeEach(async ({ page }) => {
    carSearchPage = new CarSearchPage(page);
    await carSearchPage.navigate();
  });

  test('should search for available cars by location and date', async ({ page }) => {
    const location = 'New York';
    const pickupDate = '2024-12-20';
    const returnDate = '2024-12-25';

    await carSearchPage.selectLocation(location);
    await carSearchPage.selectPickupDate(pickupDate);
    await carSearchPage.selectReturnDate(returnDate);
    await carSearchPage.clickSearchButton();

    const resultCount = await carSearchPage.getSearchResults();
    expect(resultCount).toBeGreaterThan(0);

    const listings = await carSearchPage.getCarListings();
    expect(listings.length).toBeGreaterThan(0);

    const firstListing = listings[0];
    await expect(firstListing).toContainText(/car|vehicle/i);
  });

  test('should display no results message when no cars available', async ({ page }) => {
    const location = 'Remote Island';
    const pickupDate = '2024-12-20';
    const returnDate = '2024-12-25';

    await carSearchPage.selectLocation(location);
    await carSearchPage.selectPickupDate(pickupDate);
    await carSearchPage.selectReturnDate(returnDate);
    await carSearchPage.clickSearchButton();

    const noResultsMessage = await carSearchPage.getNoResultsMessage();
    expect(noResultsMessage).toContain('No cars available');
  });
});