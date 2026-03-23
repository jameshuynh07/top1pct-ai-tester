import { test, expect } from '@playwright/test';

class BookingPage {
  constructor(private page) {}

  async navigateToBooking() {
    await this.page.goto('/booking');
  }

  async fillBookingForm(details: {
    name: string;
    email: string;
    date: string;
    time: string;
  }) {
    await this.page.fill('input[name="name"]', details.name);
    await this.page.fill('input[name="email"]', details.email);
    await this.page.fill('input[name="date"]', details.date);
    await this.page.fill('input[name="time"]', details.time);
  }

  async submitBooking() {
    await this.page.click('button[type="submit"]');
  }

  async getConfirmationMessage(): Promise<string> {
    const confirmationElement = await this.page.locator(
      '[data-testid="confirmation-message"]'
    );
    return confirmationElement.textContent();
  }

  async getConfirmationNumber(): Promise<string> {
    const confirmationNumber = await this.page.locator(
      '[data-testid="confirmation-number"]'
    );
    return confirmationNumber.textContent();
  }

  async isConfirmationDisplayed(): Promise<boolean> {
    const confirmationElement = await this.page.locator(
      '[data-testid="confirmation-message"]'
    );
    return confirmationElement.isVisible();
  }
}

class EmailService {
  constructor(private page) {}

  async waitForConfirmationEmail(
    email: string,
    timeout: number = 30000
  ): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        async (emailAddress) => {
          const response = await fetch(`/api/emails?recipient=${emailAddress}`);
          const emails = await response.json();
          return emails.some((e) => e.subject.includes('Booking Confirmation'));
        },
        email,
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }

  async getConfirmationEmailContent(email: string): Promise<string> {
    const response = await this.page.evaluate(
      async (emailAddress) => {
        const res = await fetch(`/api/emails?recipient=${emailAddress}`);
        const emails = await res.json();
        const confirmationEmail = emails.find((e) =>
          e.subject.includes('Booking Confirmation')
        );
        return confirmationEmail?.body || '';
      },
      email
    );
    return response;
  }
}

test('User can complete a booking and receive confirmation email', async ({
  page,
}) => {
  const bookingPage = new BookingPage(page);
  const emailService = new EmailService(page);

  const testEmail = 'test@example.com';
  const bookingDetails = {
    name: 'John Doe',
    email: testEmail,
    date: '2024-12-25',
    time: '14:00',
  };

  // Navigate to booking page
  await bookingPage.navigateToBooking();

  // Fill in booking form
  await bookingPage.fillBookingForm(bookingDetails);

  // Submit booking
  await bookingPage.submitBooking();

  // Verify confirmation is displayed on page
  const isConfirmationVisible = await bookingPage.isConfirmationDisplayed();
  expect(isConfirmationVisible).toBe(true);

  // Get confirmation message
  const confirmationMessage = await bookingPage.getConfirmationMessage();
  expect(confirmationMessage).toContain('Booking Confirmed');

  // Get confirmation number
  const confirmationNumber = await bookingPage.getConfirmationNumber();
  expect(confirmationNumber).toBeTruthy();

  // Wait for confirmation email
  const emailReceived = await emailService.waitForConfirmationEmail(testEmail);
  expect(emailReceived).toBe(true);

  // Verify email content contains confirmation details
  const emailContent = await emailService.getConfirmationEmailContent(testEmail);
  expect(emailContent).toContain(confirmationNumber);
  expect(emailContent).toContain(bookingDetails.name);
  expect(emailContent).toContain(bookingDetails.date);
});