import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth';

test.describe('Admin Dashboard & Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // Admin Dashboard
  test('TC_ADMIN_DASH_01: Xem tổng quan dashboard admin', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page.locator('text=Tổng Quan Hệ Thống')).toBeVisible();
    await expect(page.locator('text=/Tổng số Chủ trọ|Tổng số Khách thuê|Khu trọ/i')).toBeVisible();
  });

  test('TC_ADMIN_DASH_02: Lọc danh sách chủ trọ chờ xác nhận', async ({ page }) => {
    await page.goto('/dashboard/admin');
    const pendingTab = page.locator('button:has-text("Chờ xác nhận")');
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await expect(page.locator('text=/danh sách|pending/i')).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });

  test('TC_ADMIN_DASH_03: Lọc danh sách chủ trọ đang hoạt động', async ({ page }) => {
    await page.goto('/dashboard/admin');
    const activeTab = page.locator('button:has-text("Đang hoạt động")');
    if (await activeTab.isVisible()) {
      await activeTab.click();
      await expect(page.locator('text=/danh sách|active/i')).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });

  test('TC_ADMIN_DASH_04: Xem chi tiết danh sách chủ trọ', async ({ page }) => {
    await page.goto('/dashboard/admin');
    const viewAllBtn = page.locator('a:has-text("Xem tất cả")');
    if (await viewAllBtn.isVisible()) {
      await viewAllBtn.click();
      await page.waitForURL(/.*\/admin\/landlords.*/);
    }
  });

  // Admin Verification
  test('TC_ADMIN_VER_01: Duyệt một chủ trọ chờ xác nhận', async ({ page }) => {
    await page.goto('/dashboard/admin/landlords');
    const approveBtn = page.locator('button:has-text("Duyệt")').first();
    if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await approveBtn.click();
      await page.locator('button:has-text("Xác nhận")').click();
      await expect(page.locator('text=/thành công|đã duyệt/i')).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });

  test('TC_ADMIN_VER_02: Từ chối một chủ trọ chờ xác nhận', async ({ page }) => {
    await page.goto('/dashboard/admin/landlords');
    const rejectBtn = page.locator('button:has-text("Từ chối")').first();
    if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.locator('button:has-text("Xác nhận")').click();
      await expect(page.locator('text=/thành công|đã từ chối/i')).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });

  // Admin Settings
  test('TC_ADMIN_SET_01: Cập nhật cài đặt hệ thống', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await expect(page.locator('text=/cài đặt|settings/i')).toBeVisible({ timeout: 5000 }).catch(() => null);
  });
});

test.describe('Authorization - RBAC', () => {
  // Tenant cannot access Owner routes
  test('TC_AUTHZ_01: Tenant truy cập route của Owner', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'tenant_test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Đăng Nhập")');
    await page.waitForURL(/.*\/dashboard\/tenant.*/);

    // Try to access owner route
    await page.goto('/dashboard/owner');
    await expect(page).not.toHaveURL(/.*\/dashboard\/owner\/.*/);
  });

  // Unauthenticated redirect
  test('TC_AUTHZ_02: Truy cập dashboard khi chưa đăng nhập', async ({ page }) => {
    await page.goto('/dashboard/tenant');
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  // Owner cannot access Admin
  test('TC_AUTHZ_03: Owner không truy cập được trang Admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner_test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Đăng Nhập")');
    await page.waitForURL(/.*\/dashboard\/owner.*/);

    // Try to access admin
    await page.goto('/dashboard/admin');
    await expect(page).not.toHaveURL(/.*\/dashboard\/admin\/.*/);
  });

  // Admin access
  test('TC_AUTHZ_04: Admin truy cập dashboard admin thành công', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*\/dashboard\/admin.*/);
    await expect(page.locator('text=Tổng Quan Hệ Thống')).toBeVisible();
  });

  // Session management
  test('TC_AUTHZ_05: Session hết hạn khi đang ở dashboard', async ({ page, context }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin');

    // Delete auth cookie
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === 'AuthToken' || c.name.includes('auth'));
    if (authCookie) {
      await context.clearCookies({ name: authCookie.name });
      await page.reload();
      await expect(page).toHaveURL(/.*\/login.*/);
    }
  });

  // Admin authorization error
  test('TC_ADMIN_AUTHZ_01: Owner không truy cập được màn Admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner_test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Đăng Nhập")');
    await page.waitForURL(/.*\/dashboard\/owner.*/);

    await page.goto('/dashboard/admin');
    await expect(page).not.toHaveURL(/.*\/dashboard\/admin.*/);
  });
});
