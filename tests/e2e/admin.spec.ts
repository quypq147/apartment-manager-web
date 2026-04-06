import { test, expect } from '../fixtures/auth';

test.describe('Admin Dashboard và RBAC', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('Admin Dashboard xuất hiện', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('Admin có thể chuyển đổi giữa các tab lọc chủ nhà', async ({ page }) => {
    await page.goto('/dashboard/admin');

    const pending = page.locator('button').filter({ hasText: /\(2\)/ }).first();
    const active = page.locator('button').filter({ hasText: /\(3\)/ }).first();

    await expect(pending).toBeVisible();
    await expect(active).toBeVisible();

    await active.click();
    await expect(active).toHaveClass(/bg-green-100/);

    await pending.click();
    await expect(pending).toHaveClass(/bg-yellow-100/);
  });

  test('Admin trang settings xuất hiện', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await expect(page).toHaveURL(/\/dashboard\/admin\/settings/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Bảo mật', () => {
  test('Người dùng chưa xác thực bị chuyển hướng từ bảng điều khiển admin', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/);
  });

  test('Tenant không thể ở lại bảng điều khiển admin', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard\/tenant/);
  });

  test('Owner không thể ở lại bảng điều khiển admin', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard\/owner/);
  });

  test('Session hết hạn chuyển hướng đến trang đăng nhập', async ({ page, context, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin');

    await context.clearCookies();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/);
  });
});
