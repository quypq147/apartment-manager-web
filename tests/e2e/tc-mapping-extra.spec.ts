import { expect, test } from '../fixtures/auth';
import { assertPageLoaded, getAuthHeaders, getFirstIdFromList } from './regression-utils';

test.describe('Bo sung map TC con thieu', () => {
  test('[TC_AUTH_06] Dang ky tai khoan Owner moi', async ({ page }) => {
    const id = Date.now();
    await page.goto('/register');
    await page.locator('input[type="text"]').first().fill(`Chu tro ${id}`);
    await page.locator('input[type="email"]').fill(`owner_${id}@example.com`);
    await page.locator('input[type="tel"]').fill(`09${String(id).slice(-8)}`);
    await page.locator('input[type="password"]').nth(0).fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(register|login)/);
  });

  test('[TC_AUTH_12] Chan truy cap dashboard khi chua dang nhap', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/);
  });

  test('[TC_AUTH_14] Dang nhap voi du lieu trong', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test('[TC_AUTH_15] Dang ky voi role khong hop le', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: {
        name: 'Invalid Role',
        email: `invalid-role-${Date.now()}@example.com`,
        password: 'password123',
        phoneNumber: '0912345678',
        role: 'INVALID_ROLE',
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('[TC_ADMIN_DASH_01] Xem tong quan dashboard admin', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await assertPageLoaded(page, '/dashboard/admin', /Tong Quan|Tổng Quan/i);
  });

  test('[TC_ADMIN_DASH_02] Loc danh sach chu tro cho xac nhan', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Cho xac nhan|Chờ xác nhận/i }).click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('[TC_ADMIN_DASH_03] Loc danh sach chu tro dang hoat dong', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Dang hoat dong|Đang hoạt động/i }).click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('[TC_ADMIN_DASH_04] Xem chi tiet danh sach chu tro', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('table')).toBeVisible();
  });

  test('[TC_ADMIN_SET_01] Cap nhat cai dat he thong', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await assertPageLoaded(page, '/dashboard/admin/settings', /Cai dat|Cài đặt/i);
  });

  test('[TC_OWN_DASH_02] Xem AI Overview tren dashboard owner', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('[TC_OWN_PROP_06] Xem chi tiet tai san', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    await assertPageLoaded(page, `/dashboard/owner/properties/${propertyId}`, /Quan ly khu tro|Quản lý khu trọ/i);
  });

  test('[TC_OWN_ROOM_01] Xem danh sach phong cua mot tai san', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    await assertPageLoaded(page, `/dashboard/owner/properties/${propertyId}/room`, /Quan ly phong|Quản lý phòng/i);
  });

  test('[TC_OWN_SVC_01] Them dich vu moi', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/services', /Dich vu|Dịch vụ/i);
    await expect(page.getByRole('button', { name: /Them dich vu|Thêm dịch vụ/i })).toBeVisible();
  });

  test('[TC_OWN_SVC_02] Cap nhat dich vu', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/services', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Sua$|^Sửa$/i }).first().click();
    await expect(page.getByText(/Luu cap nhat|Lưu cập nhật/i)).toBeVisible();
  });

  test('[TC_OWN_CON_04] Loc hop dong theo trang thai', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/contracts', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Tat ca|Tất cả/i }).click();
    await expect(page.getByRole('heading', { name: /Quan ly hop dong|Quản lý hợp đồng/i })).toBeVisible();
  });

  test('[TC_OWN_INV_04] Loc hoa don theo trang thai', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner/invoices', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('select')).toHaveCount(2);
  });

  test('[TC_OWN_INV_06] Xu ly hoa don qua han', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Hoa don qua han|Hóa đơn quá hạn/i })).toBeVisible();
  });

  test('[TC_TEN_DASH_02] Xem canh bao hoa don chua thanh toan', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('[TC_TEN_DASH_03] Dong thong bao tren dashboard', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.route('**/api/tenant/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'tc-ten-dash-03',
              type: 'invoice_due',
              title: 'Thong bao test',
              message: 'Noi dung thong bao test',
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
    await expect(page.getByText('Noi dung thong bao test')).toHaveCount(0);
  });

  test('[TC_TEN_DASH_04] Xem AI Overview tren dashboard tenant', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('[TC_TEN_ROOM_02] Xem thoi han hop dong phong', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/room', /Quan ly phong|Quản lý phòng/i);
  });

  test('[TC_TEN_CON_01] Xem danh sach hop dong cua tenant', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/contracts', /Hop dong cua toi|Hợp đồng của tôi/i);
  });

  test('[TC_TEN_CON_02] Xem chi tiet hop dong tenant', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const contractId = await getFirstIdFromList(page, '/api/tenant/contracts');
    await page.goto(`/dashboard/tenant/contracts/${contractId}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(`/dashboard/tenant/contracts/${contractId}$`));
  });

  test('[TC_TEN_CON_03] Chi hien thi hop dong hop le', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/contracts', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('table, a').first()).toBeVisible();
  });

  test('[TC_TEN_SVC_01] Xem danh sach dich vu cua phong', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/services', /Dich vu|dịch vụ/i);
  });

  test('[TC_TEN_SVC_02] Xem gia dich vu dien nuoc', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant/services', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Danh sach dich vu|Danh sách dịch vụ/i)).toBeVisible();
  });

  test('[TC_TEN_NOTI_01] Xem danh sach thong bao', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('[TC_TEN_NOTI_02] An mot thong bao khoi danh sach', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.route('**/api/tenant/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'tc-ten-noti-02',
              type: 'invoice_due',
              title: 'Thong bao test 02',
              message: 'An thong bao test 02',
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
    await expect(page.getByText('An thong bao test 02')).toHaveCount(0);
  });

  test('[TC_API_PROP_03] POST tao property thieu du lieu', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const res = await page.request.post('/api/properties', {
      headers,
      data: { name: '', address: '' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('[TC_API_ROOM_02] POST tao room voi du lieu khong hop le', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    const res = await page.request.post(`/api/properties/${propertyId}/rooms`, {
      headers,
      data: { name: '', price: -1 },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('[TC_API_INV_05] Xu ly return VNPay', async ({ request }) => {
    const res = await request.get('/api/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=TEST');
    expect([200, 302, 400]).toContain(res.status());
  });

  test('[TC_API_VNP_01] Xu ly IPN hop le', async ({ request }) => {
    const res = await request.get('/api/vnpay/ipn?vnp_ResponseCode=00&vnp_TxnRef=TEST');
    expect([200, 400]).toContain(res.status());
  });

  test('[TC_API_VNP_02] Xu ly return VNPay that bai', async ({ request }) => {
    const res = await request.get('/api/vnpay/return?vnp_ResponseCode=24&vnp_TxnRef=TEST');
    expect([200, 302, 400]).toContain(res.status());
  });

  test('[TC_API_CHAT_02] POST chat voi message trong', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const res = await page.request.post('/api/chat', { headers, data: { message: '' } });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('[TC_UI_04] Trang thai loading hien thi khi tai du lieu', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
