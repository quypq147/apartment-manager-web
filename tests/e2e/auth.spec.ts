import { test, expect } from '../fixtures/auth';

test.describe('Authentication', () => {
  test('owner login success', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await expect(page).toHaveURL(/\/dashboard\/owner/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('tenant login success', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await expect(page).toHaveURL(/\/dashboard\/tenant/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('admin login success', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner_test@example.com');
    await page.fill('input[type="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('register success', async ({ page }) => {
    const id = Date.now();

    await page.goto('/register');
    await page.locator('input[type="text"]').first().fill(`Owner ${id}`);
    await page.locator('input[type="email"]').fill(`owner_${id}@example.com`);
    await page.locator('input[type="tel"]').fill(`09${String(id).slice(-8)}`);
    await page.locator('input[type="password"]').nth(0).fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(register|login)/);
  });

  test('register duplicate email failed', async ({ page }) => {
    await page.goto('/register');
    await page.locator('input[type="text"]').first().fill('Dup Owner');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('owner_test@example.com');
    await emailInput.blur();
    await page.locator('input[type="password"]').nth(0).fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('password123');

    await expect(page.locator('text=Email đã được đăng ký').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('forgot-password invalid email blocked by browser', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('logout success', async ({ page, loginAsOwner, logout }) => {
    await loginAsOwner();
    await logout();
    await expect(page).toHaveURL(/\/login/);
  });
});
