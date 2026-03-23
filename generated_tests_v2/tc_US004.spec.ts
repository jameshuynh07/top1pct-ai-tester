import { test, expect } from '@playwright/test';

class CarsPage {
  constructor(private page) {}

  async navigate() {
    await this.page.goto('/cars');
  }

  async filterByType(type: 'sedan' | 'SUV' | 'electric') {
    const filterButton = this.page.locator(`[data-testid="filter-${type}"]`);
    await filterButton.click();
  }

  async getCarsList() {
    return this.page.locator('[data-testid="car-item"]');
  }

  async getCarType(carElement) {
    return carElement.locator('[data-testid="car-type"]').textContent();
  }

  async clearFilters() {
    await this.page.locator('[data-testid="clear-filters"]').click();
  }
}

test.describe('Car Filter by Type', () => {
  let carsPage: CarsPage;

  test.beforeEach(async ({ page }) => {
    carsPage = new CarsPage(page);
    await carsPage.navigate();
  });

  test('should filter cars by sedan type', async ({ page }) => {
    await carsPage.filterByType('sedan');
    
    const carsList = await carsPage.getCarsList();
    const count = await carsList.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const carType = await carsPage.getCarType(carsList.nth(i));
      expect(carType).toBe('Sedan');
    }
  });

  test('should filter cars by SUV type', async ({ page }) => {
    await carsPage.filterByType('SUV');
    
    const carsList = await carsPage.getCarsList();
    const count = await carsList.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const carType = await carsPage.getCarType(carsList.nth(i));
      expect(carType).toBe('SUV');
    }
  });

  test('should filter cars by electric type', async ({ page }) => {
    await carsPage.filterByType('electric');
    
    const carsList = await carsPage.getCarsList();
    const count = await carsList.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const carType = await carsPage.getCarType(carsList.nth(i));
      expect(carType).toBe('Electric');
    }
  });

  test('should clear filters and show all cars', async ({ page }) => {
    await carsPage.filterByType('sedan');
    let carsListFiltered = await carsPage.getCarsList();
    const filteredCount = await carsListFiltered.count();
    
    await carsPage.clearFilters();
    let carsListAll = await carsPage.getCarsList();
    const allCount = await carsListAll.count();
    
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });
});