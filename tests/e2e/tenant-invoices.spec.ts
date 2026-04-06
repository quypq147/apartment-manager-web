import { test, expect } from '../fixtures/auth';

test.describe('Tenant pages and vnpay', () => {
  test.beforeEach(async ({ loginAsTenant }) => {
    await loginAsTenant();
  });

  test('tenant dashboard loads', async ({ page }) => {
    await page.goto('/dashboard/tenant');
    await expect(page).toHaveURL(/\/dashboard\/tenant/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('tenant invoices page loads and filter buttons clickable', async ({ page }) => {
    await page.goto('/dashboard/tenant/invoices');
    await expect(page).toHaveURL(/\/dashboard\/tenant\/invoices/);
    await expect(page.locator('h1').first()).toBeVisible();

    const statusButtons = page.locator('button');
    const count = await statusButtons.count();
    expect(count).toBeGreaterThan(2);
    await statusButtons.nth(0).click();
    await statusButtons.nth(1).click();
  });

  test('tenant room/services/contracts pages load', async ({ page }) => {
    await page.goto('/dashboard/tenant/room');
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/dashboard/tenant/services');
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/dashboard/tenant/contracts');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('vnpay flow mocked', async ({ page }) => {
    await page.route('**/api/invoices/*/vnpay', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            paymentUrl: 'http://localhost:3000/dashboard/tenant/invoices?payment=success&invoiceId=TEST_INV',
            invoiceId: 'TEST_INV',
            amount: 100000,
            txnRef: 'TEST_REF',
          },
        }),
      });
    });

    await page.goto('/dashboard/tenant/invoices');

    const payBtn = page.locator('button:has-text("VNPAY")').first();
    if (await payBtn.isVisible().catch(() => false)) {
      await payBtn.click();
      await expect(page).toHaveURL(/payment=success/);
    }
  });
});
