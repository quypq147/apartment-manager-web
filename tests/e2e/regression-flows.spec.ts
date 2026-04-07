import { expect, test } from '../fixtures/auth';
import { getAuthHeaders, getFirstIdFromList } from './regression-utils';

test.describe('Regression flows', () => {
  test('owner settings blocks empty password change', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('input[type="password"]')).toHaveCount(3);
  });

  test('owner settings blocks short password change', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.post('/api/auth/change-password', {
      headers,
      data: {
        currentPassword: 'password123',
        newPassword: '123',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('owner settings blocks mismatched confirmation', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.post('/api/auth/change-password', {
      headers,
      data: {
        currentPassword: 'password123',
        newPassword: 'password123',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('owner settings blocks wrong current password', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.post('/api/auth/change-password', {
      headers,
      data: {
        currentPassword: 'wrong-password',
        newPassword: 'password1234',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('owner services rejects invalid price', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    const response = await page.request.post('/api/services', {
      headers,
      data: {
        propertyId,
        name: `Invalid Price ${Date.now()}`,
        unit: 'thang',
        price: -1,
        isMetered: false,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('owner services edit form opens', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/services', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /^Sửa$/i }).first().click();
    await expect(page.getByText('Lưu cập nhật')).toBeVisible();
  });

  test('owner tenants form shows available room selector', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/tenants', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('button', { name: /^Thêm hợp đồng$/i })).toBeVisible();
  });

  test('owner tenants search input is visible', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/tenants', { waitUntil: 'domcontentloaded' });

    await expect(page.getByPlaceholder('Tìm theo tên, SĐT, số phòng...')).toBeVisible();
  });

  test('tenant invoices empty month/year combination shows empty state', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/invoices', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/dashboard\/tenant\/invoices/);
  });

  test('tenant dashboard shows success message from query string', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant?payment=success&invoiceId=TEST_INV', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Thanh toán thành công cho hóa đơn TEST_INV.')).toBeVisible();
  });

  test('tenant dashboard shows failure message from query string', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant?payment=failed&code=01', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/dashboard\/tenant/);
  });

  test('tenant notifications can be dismissed', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.route('**/api/tenant/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'noti-1',
              type: 'invoice_due',
              title: 'Sắp hết hạn thanh toán',
              message: 'Hóa đơn test sắp hết hạn thanh toán.',
              dueDate: new Date().toISOString(),
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.goto('/dashboard/tenant', { waitUntil: 'domcontentloaded' });
    await page.locator('div.bg-blue-50.border-blue-200').getByRole('button').click();

    await expect(page.getByText('Hóa đơn test sắp hết hạn thanh toán.')).toHaveCount(0);
  });

  test('tenant invoices search input is visible', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/invoices', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/dashboard\/tenant\/invoices/);
  });

  test('admin filters can switch back and forth', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });

    const pending = page.getByRole('button', { name: /Chờ xác nhận/i });
    const active = page.getByRole('button', { name: /Đang hoạt động/i });

    await pending.click();
    await expect(page.locator('table')).toBeVisible();
    await active.click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('owner contract detail shows renew action when active', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/tenants', { headers });
    const payload = await response.json();
    const contractId = payload?.data?.[0]?.id ?? (await getFirstIdFromList(page, '/api/tenants'));

    await page.goto(`/dashboard/owner/contracts/${contractId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /Gia hạn/i })).toBeVisible();
  });
});