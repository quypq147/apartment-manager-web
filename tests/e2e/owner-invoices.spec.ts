import { test, expect } from '../fixtures/auth';

test.describe('Owner pages smoke', () => {
  test.beforeEach(async ({ loginAsOwner }) => {
    await loginAsOwner();
  });

  test('contracts page loads', async ({ page }) => {
    await page.goto('/dashboard/owner/contracts');
    await expect(page).toHaveURL(/\/dashboard\/owner\/contracts/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('invoices page loads', async ({ page }) => {
    await page.goto('/dashboard/owner/invoices');
    await expect(page).toHaveURL(/\/dashboard\/owner\/invoices/);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/dashboard/owner/services');
    await expect(page).toHaveURL(/\/dashboard\/owner\/services/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('tenants page loads', async ({ page }) => {
    await page.goto('/dashboard/owner/tenants');
    await expect(page).toHaveURL(/\/dashboard\/owner\/tenants/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
