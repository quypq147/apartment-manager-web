import { test, expect } from '../fixtures/auth';

test.describe('Owner properties', () => {
  test.beforeEach(async ({ loginAsOwner }) => {
    await loginAsOwner();
  });

  test('properties page loads', async ({ page }) => {
    await page.goto('/dashboard/owner/properties');
    await expect(page).toHaveURL(/\/dashboard\/owner\/properties/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('create property via UI', async ({ page }) => {
    const unique = Date.now();
    const propertyName = `Property ${unique}`;

    await page.goto('/dashboard/owner/properties');
    await page.getByRole('button', { name: /Them Khu Tro|Thêm Khu Trọ/i }).click();

    await page.locator('input[placeholder]').nth(0).fill(propertyName);
    await page.locator('input[placeholder]').nth(1).fill('456 Test Street');
    await page.getByRole('button', { name: /Luu|Lưu/i }).click();

    await expect(page.getByRole('heading', { name: propertyName })).toBeVisible();
  });

  test('navigate to property detail', async ({ page }) => {
    await page.goto('/dashboard/owner/properties');
    const link = page.locator('a[href*="/dashboard/owner/properties/"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/dashboard\/owner\/properties\/.+/);
  });
});
