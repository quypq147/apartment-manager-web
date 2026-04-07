import { expect, test } from '../fixtures/auth';
import { assertPageLoaded, getFirstIdFromList } from './regression-utils';

test.describe('Regression core', () => {
  test('owner login redirects to owner dashboard', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await expect(page).toHaveURL(/\/dashboard\/owner/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('tenant login redirects to tenant dashboard', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await expect(page).toHaveURL(/\/dashboard\/tenant/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('admin login redirects to admin dashboard', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('wrong password shows login error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner_test@example.com');
    await page.fill('input[type="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('empty login fields stay on login page', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/);
  });

  test('duplicate email registration shows validation', async ({ page }) => {
    await page.goto('/register');
    await page.locator('input[type="text"]').first().fill('Dup Owner');
    await page.locator('input[type="email"]').fill('owner_test@example.com');
    await page.locator('input[type="email"]').blur();
    await page.locator('input[type="password"]').nth(0).fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('password123');

    await expect(page.getByText('Email đã được đăng ký').first()).toBeVisible();
  });

  test('forgot password with invalid email remains on page', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('logout returns to login', async ({ page, loginAsOwner, logout }) => {
    await loginAsOwner();
    await logout();

    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated admin dashboard redirects to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated owner dashboard redirects to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated tenant dashboard redirects to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard/tenant', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/);
  });

  test('tenant cannot stay on admin dashboard', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/dashboard\/tenant/);
  });

  test('owner cannot stay on admin dashboard', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/dashboard\/owner/);
  });

  test('owner dashboard loads', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner', /Tổng Quan/i);
    await expect(page.getByRole('link', { name: /Tạo hóa đơn mới/i })).toBeVisible();
  });

  test('owner properties page loads', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/properties', /Khu Trọ|Phòng/i);
    await expect(page.getByRole('button', { name: /Thêm Khu Trọ/i })).toBeVisible();
  });

  test('owner properties page shows property cards', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/properties', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Khu Trọ Test - Automation')).toBeVisible();
  });

  test('owner property detail page loads from first property link', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const propertyId = await getFirstIdFromList(page, '/api/properties');

    await assertPageLoaded(page, `/dashboard/owner/properties/${propertyId}`, /Quản lý khu trọ/i);
    await expect(page.getByRole('heading', { name: /Quản lý khu trọ/i })).toBeVisible();
  });

  test('owner room management page loads from property detail', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const propertyId = await getFirstIdFromList(page, '/api/properties');

    await assertPageLoaded(page, `/dashboard/owner/properties/${propertyId}/room`, /Quan ly phong|Quản lý phòng/i);
    await expect(page.getByRole('heading', { name: 'Them phong moi' })).toBeVisible();
  });

  test('owner contracts page loads', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/contracts', /Quản lý hợp đồng/i);
    await expect(page.getByRole('button', { name: /Tất cả/i })).toBeVisible();
  });

  test('owner contract detail page loads from first contract link', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const contractId = await getFirstIdFromList(page, '/api/tenants');

    await assertPageLoaded(page, `/dashboard/owner/contracts/${contractId}`, /Chi tiết hợp đồng/i);
    await expect(page.getByText('Thông tin hợp đồng')).toBeVisible();
  });

  test('owner invoices page loads', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/invoices', /Hóa Đơn|Hóa đơn/i);
    await expect(page.getByPlaceholder('Tìm theo mã phòng, tên khách...')).toBeVisible();
  });

  test('owner services page loads', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/services', /Quản lý Dịch vụ/i);
    await expect(page.getByRole('button', { name: /Thêm dịch vụ/i })).toBeVisible();
  });

  test('owner tenants page loads', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/tenants', /Khách Thuê/i);
    await expect(page.getByRole('button', { name: /Thêm hợp đồng/i })).toBeVisible();
  });

  test('owner settings page loads', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/settings', /Cài đặt tài khoản Chủ trọ/i);
    await expect(page.locator('input[type="password"]')).toHaveCount(3);
  });

  test('owner dashboard shows overdue section', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Hóa đơn quá hạn' })).toBeVisible();
  });

  test('tenant dashboard loads', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant', /Tổng Quan/i);
  });

  test('tenant room page loads', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/room', /Quản lý phòng/i);
    await expect(page.getByText('Dịch vụ phòng')).toBeVisible();
  });

  test('tenant services page loads', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/services', /Quản lý dịch vụ/i);
    await expect(page.getByText('Danh sách dịch vụ')).toBeVisible();
  });

  test('tenant invoices page loads', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/invoices', /Hóa đơn/i);
    await expect(page.locator('table')).toBeVisible();
  });

  test('tenant contracts page loads', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/contracts', /Hợp đồng của tôi/i);
  });

  test('tenant contract detail page loads from first contract link', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const contractId = await getFirstIdFromList(page, '/api/tenant/contracts');

    await page.goto(`/dashboard/tenant/contracts/${contractId}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(`/dashboard/tenant/contracts/${contractId}$`));
  });

  test('tenant settings page loads', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/settings', /Cài đặt tài khoản Khách thuê/i);
    await expect(page.locator('input[type="password"]')).toHaveCount(3);
  });

  test('admin dashboard loads', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await assertPageLoaded(page, '/dashboard/admin', /Tổng Quan Hệ Thống/i);
    await expect(page.getByRole('link', { name: 'Quản lý Chủ trọ' })).toBeVisible();
  });

  test('admin dashboard shows pending and active tabs', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('button', { name: /Chờ xác nhận/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Đang hoạt động/i })).toBeVisible();
  });

  test('admin tab switching highlights pending landlords', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    const pending = page.getByRole('button', { name: /Chờ xác nhận/i });
    const active = page.getByRole('button', { name: /Đang hoạt động/i });

    await active.click();
    await expect(page.locator('table')).toBeVisible();
    await pending.click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('admin settings page loads', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await assertPageLoaded(page, '/dashboard/admin/settings', /Cài đặt hệ thống/i);
    await expect(page.locator('input[type="password"]')).toHaveCount(3);
  });

  test('admin dashboard table is visible', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('table')).toBeVisible();
  });

  test('owner settings theme toggle is visible', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Chuyen giao dien sang toi')).toBeVisible();
  });

  test('tenant settings theme toggle is visible', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Chuyen giao dien sang toi')).toBeVisible();
  });

  test('admin settings theme toggle is visible', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Chuyen giao dien sang toi')).toBeVisible();
  });

  test('owner properties create form toggles', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/properties', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('button', { name: /^Thêm Khu Trọ$/i })).toBeVisible();
  });

  test('owner services create form toggles', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/services', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('button', { name: /^Thêm dịch vụ$/i })).toBeVisible();
  });

  test('owner invoices search input is visible', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/invoices', { waitUntil: 'domcontentloaded' });

    await expect(page.getByPlaceholder('Tìm theo mã phòng, tên khách...')).toBeVisible();
    await expect(page.locator('select')).toHaveCount(2);
  });

  test('tenant invoices controls are clickable', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/invoices', { waitUntil: 'domcontentloaded' });

    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
    const count = await buttons.count();
    expect(count).toBeGreaterThan(2);
  });

  test('tenant room services table is visible', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/room', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('table')).toBeVisible();
  });

  test('owner dashboard invoice link is visible', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('link', { name: /Tạo hóa đơn mới/i })).toBeVisible();
  });

  test('tenant dashboard room card loads', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/dashboard\/tenant/);
  });

  test('owner properties list navigation link is visible', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/properties', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('link', { name: /Quan ly khu tro|Quản lý khu trọ/i }).first()).toBeVisible();
  });

  test('owner contracts list navigation link is visible', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/contracts', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Quản lý hợp đồng/i })).toBeVisible();
  });

  test('tenant contracts list navigation link is visible', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/contracts', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('link', { name: /Xem chi tiết & Hóa đơn/i }).first()).toBeVisible();
  });
});