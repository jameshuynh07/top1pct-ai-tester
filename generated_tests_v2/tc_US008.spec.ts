import { test, expect } from '@playwright/test';

class BookingPage {
  constructor(private page) {}

  async navigateToBookings() {
    await this.page.goto('/bookings');
  }

  async getBookingByReference(reference: string) {
    return this.page.locator(`[data-booking-ref="${reference}"]`);
  }

  async clickCancelButton(bookingElement) {
    await bookingElement.locator('button:has-text("Cancel Booking")').click();
  }

  async confirmCancellation() {
    await this.page.locator('button:has-text("Confirm Cancellation")').click();
  }

  async getRefundStatus() {
    return this.page.locator('[data-refund-status]').textContent();
  }

  async getRefundAmount() {
    return this.page.locator('[data-refund-amount]').textContent();
  }

  async getBookingStatus(bookingElement) {
    return bookingElement.locator('[data-status]').textContent();
  }

  async getCancellationMessage() {
    return this.page.locator('[data-cancellation-message]').textContent();
  }
}

test('User can cancel a booking within 24 hours for full refund', async ({ page }) => {
  const bookingPage = new BookingPage(page);
  const bookingReference = 'BK123456';
  const originalPrice = '$100.00';

  await bookingPage.navigateToBookings();

  const bookingElement = await bookingPage.getBookingByReference(bookingReference);
  await expect(bookingElement).toBeVisible();

  const initialStatus = await bookingPage.getBookingStatus(bookingElement);
  expect(initialStatus).toBe('Confirmed');

  await bookingPage.clickCancelButton(bookingElement);

  const confirmButton = page.locator('button:has-text("Confirm Cancellation")');
  await expect(confirmButton).toBeVisible();

  await bookingPage.confirmCancellation();

  await expect(page.locator('[data-cancellation-message]')).toContainText('Booking cancelled successfully');

  const refundStatus = await bookingPage.getRefundStatus();
  expect(refundStatus).toBe('Full Refund');

  const refundAmount = await bookingPage.getRefundAmount();
  expect(refundAmount).toBe(originalPrice);

  const updatedBookingElement = await bookingPage.getBookingByReference(bookingReference);
  const updatedStatus = await bookingPage.getBookingStatus(updatedBookingElement);
  expect(updatedStatus).toBe('Cancelled');
});