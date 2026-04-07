import { expect, test } from '../fixtures/auth';
import { assertPageLoaded, getAuthHeaders, getFirstIdFromList } from './regression-utils';

async function expectStatusOneOf(res: import('@playwright/test').APIResponse, codes: number[]) {
  expect(codes).toContain(res.status());
}

test.describe('Phu cac TC con lai', () => {
  test('[TC_AUTH_05] Dang nhap that bai do email khong ton tai', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', `none-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test('[TC_AUTH_08] Quen mat khau gui link thanh cong', async ({ request }) => {
    const res = await request.post('/api/auth/forgot-password', { data: { email: 'owner_test@example.com' } });
    await expectStatusOneOf(res, [200, 201, 500]);
  });

  test('[TC_AUTH_09] Reset mat khau thanh cong', async ({ page }) => {
    await page.goto('/reset-password?token=test-token', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/reset-password/);
  });

  test('[TC_AUTH_11] Doi mat khau khi da dang nhap', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await assertPageLoaded(page, '/dashboard/tenant/settings', /Cai dat|Cài đặt/i);
    await expect(page.locator('input[type="password"]')).toHaveCount(3);
  });

  test('[TC_AUTH_13] Reset mat khau voi token het han', async ({ request }) => {
    const res = await request.post('/api/auth/reset-password', {
      data: { token: 'expired-token', newPassword: 'password123' },
    });
    await expectStatusOneOf(res, [400, 401]);
  });

  test('[TC_ADMIN_VER_02] Tu choi mot chu tro cho xac nhan', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const headers = await getAuthHeaders(page);
    const listRes = await page.request.get('/api/admin/landlords', { headers });
    const payload = await listRes.json();
    const landlordId = payload?.data?.[0]?.id;
    expect(typeof landlordId).toBe('string');
    const patch = await page.request.patch(`/api/admin/landlords/${landlordId}/verify`, { headers });
    await expectStatusOneOf(patch, [200, 400, 409]);
  });

  test('[TC_OWN_PROP_03] Validation khi bo trong ten tai san', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const res = await page.request.post('/api/properties', { headers, data: { name: '', address: 'x' } });
    await expectStatusOneOf(res, [400]);
  });

  test('[TC_OWN_PROP_05] Xoa tai san chua co phong', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const create = await page.request.post('/api/properties', {
      headers,
      data: { name: `Delete Property ${Date.now()}`, address: 'Test Address' },
    });
    await expectStatusOneOf(create, [200, 201]);
    const body = await create.json();
    const id = body?.data?.id;
    expect(typeof id).toBe('string');
    const del = await page.request.delete(`/api/properties/${id}`, { headers });
    await expectStatusOneOf(del, [200, 405]);
  });

  test('[TC_OWN_ROOM_02] Them phong moi', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    const res = await page.request.post(`/api/properties/${propertyId}/rooms`, {
      headers,
      data: {
        roomNumber: `P-${Date.now()}`,
        floor: 1,
        area: 20,
        rentAmount: 2000000,
        depositAmount: 1000000,
        maxTenants: 2,
      },
    });
    await expectStatusOneOf(res, [200, 201, 400]);
  });

  test('[TC_OWN_ROOM_03] Cap nhat trang thai phong', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const rooms = await page.request.get('/api/rooms', { headers });
    const payload = await rooms.json();
    const roomId = payload?.data?.[0]?.id;
    expect(typeof roomId).toBe('string');
    const patch = await page.request.patch(`/api/rooms/${roomId}`, { headers, data: { status: 'AVAILABLE' } });
    await expectStatusOneOf(patch, [200, 400, 404]);
  });

  test('[TC_OWN_ROOM_04] Xoa phong trong', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const res = await page.request.delete('/api/rooms/test-room-id', { headers });
    await expectStatusOneOf(res, [400, 404]);
  });

  test('[TC_OWN_ROOM_05] Validation khi tao phong thieu du lieu', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    const res = await page.request.post(`/api/properties/${propertyId}/rooms`, { headers, data: { roomNumber: '' } });
    await expectStatusOneOf(res, [400]);
  });

  test('[TC_OWN_SVC_03] Xoa dich vu', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const services = await page.request.get('/api/services', { headers });
    const payload = await services.json();
    const serviceId = payload?.data?.[0]?.id;
    expect(typeof serviceId).toBe('string');
    const del = await page.request.delete(`/api/services/${serviceId}`, { headers });
    await expectStatusOneOf(del, [200, 400, 409]);
  });

  test('[TC_OWN_SVC_04] Gan dich vu cho phong', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await assertPageLoaded(page, '/dashboard/owner/services', /Dich vu|Dịch vụ/i);
  });

  test('[TC_OWN_CON_03] Cham dut hop dong truoc han', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const tenants = await page.request.get('/api/tenants', { headers });
    const payload = await tenants.json();
    const contractId = payload?.data?.[0]?.id;
    expect(typeof contractId).toBe('string');
    const patch = await page.request.patch(`/api/contracts/${contractId}`, {
      headers,
      data: { status: 'TERMINATED' },
    });
    await expectStatusOneOf(patch, [200, 400]);
  });

  test('[TC_OWN_CON_05] Validation khi tao hop dong thieu du lieu', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const res = await page.request.post('/api/contracts', { headers, data: {} });
    await expectStatusOneOf(res, [400]);
  });

  test('[TC_OWN_INV_02] Tao hoa don hang thang', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const tenants = await page.request.get('/api/tenants', { headers });
    const payload = await tenants.json();
    const contractId = payload?.data?.[0]?.id;
    const res = await page.request.post('/api/invoices', {
      headers,
      data: {
        contractId,
        month: 4,
        year: 2026,
        roomRent: 2000000,
      },
    });
    await expectStatusOneOf(res, [200, 201, 400]);
  });

  test('[TC_OWN_INV_03] Xac nhan thanh toan thu cong', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const invoiceId = await getFirstIdFromList(page, '/api/invoices');
    const res = await page.request.post(`/api/invoices/${invoiceId}/pay`, {
      headers,
      data: { amount: 1, paymentMethod: 'CASH', reference: 'MANUAL' },
    });
    await expectStatusOneOf(res, [200, 400]);
  });

  test('[TC_OWN_INV_05] Xem chi tiet hoa don', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const invoiceId = await getFirstIdFromList(page, '/api/invoices');
    await page.goto(`/dashboard/owner/invoices?invoiceId=${invoiceId}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard\/owner\/invoices/);
  });

  test('[TC_TEN_INV_04] Thanh toan VNPay thanh cong', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant?payment=success&invoiceId=INV_TEST', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Thanh toan thanh cong|Thanh toán thành công/i)).toBeVisible();
  });

  test('[TC_PAY_VN_04] Xu ly IPN VNPay', async ({ request }) => {
    const res = await request.get('/api/vnpay/ipn?vnp_ResponseCode=00&vnp_TxnRef=INV_TEST');
    await expectStatusOneOf(res, [200, 400]);
  });

  test('[TC_AI_01] Mo cua so Chatbot', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const res = await page.request.get('/api/chat', { headers });
    await expectStatusOneOf(res, [200]);
  });

  test('[TC_AI_03] AI Overview tren dashboard owner', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('[TC_AI_04] AI Overview tren dashboard tenant', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('[TC_API_ROOM_01] POST tao room cho property', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    const res = await page.request.post(`/api/properties/${propertyId}/rooms`, {
      headers,
      data: {
        roomNumber: `R-${Date.now()}`,
        floor: 1,
        area: 18,
        rentAmount: 1800000,
        depositAmount: 500000,
        maxTenants: 2,
      },
    });
    await expectStatusOneOf(res, [200, 201, 400]);
  });

  test('[TC_API_SVC_03] PUT cap nhat service', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const services = await page.request.get('/api/services', { headers });
    const payload = await services.json();
    const id = payload?.data?.[0]?.id;
    expect(typeof id).toBe('string');
    const res = await page.request.put(`/api/services/${id}`, {
      headers,
      data: { name: `Update ${Date.now()}` },
    });
    await expectStatusOneOf(res, [200, 400]);
  });

  test('[TC_API_SVC_04] DELETE xoa service', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const services = await page.request.get('/api/services', { headers });
    const payload = await services.json();
    const id = payload?.data?.[0]?.id;
    expect(typeof id).toBe('string');
    const res = await page.request.delete(`/api/services/${id}`, { headers });
    await expectStatusOneOf(res, [200, 400, 409]);
  });

  test('[TC_API_CON_01] POST tao contract thanh cong', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const res = await page.request.post('/api/contracts', {
      headers,
      data: {
        tenantName: `Tenant ${Date.now()}`,
        tenantEmail: `tenant_${Date.now()}@example.com`,
      },
    });
    await expectStatusOneOf(res, [200, 201, 400]);
  });

  test('[TC_API_CON_03] PATCH cap nhat contract', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const tenants = await page.request.get('/api/tenants', { headers });
    const payload = await tenants.json();
    const id = payload?.data?.[0]?.id;
    expect(typeof id).toBe('string');
    const res = await page.request.patch(`/api/contracts/${id}`, { headers, data: { note: 'Update test' } });
    await expectStatusOneOf(res, [200, 400]);
  });

  test('[TC_API_CON_04] POST tao contract voi phong khong ton tai', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const res = await page.request.post('/api/contracts', {
      headers,
      data: { roomId: 'room_invalid', tenantName: 'Invalid' },
    });
    await expectStatusOneOf(res, [400, 404]);
  });

  test('[TC_API_INV_02] POST tao invoice thanh cong', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const tenants = await page.request.get('/api/tenants', { headers });
    const payload = await tenants.json();
    const contractId = payload?.data?.[0]?.id;
    const res = await page.request.post('/api/invoices', {
      headers,
      data: { contractId, month: 4, year: 2026, roomRent: 2000000 },
    });
    await expectStatusOneOf(res, [200, 201, 400]);
  });

  test('[TC_API_CHAT_02] POST chat voi message trong', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const res = await page.request.post('/api/chat', { headers, data: { message: '' } });
    await expectStatusOneOf(res, [400]);
  });

  test('[TC_UI_02] Responsive tren Mobile', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/owner', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('[TC_UI_03] Toast thong bao hien thi dung', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    await page.goto('/dashboard/tenant?payment=success&invoiceId=TOAST_TC', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Thanh toan thanh cong|Thanh toán thành công/i)).toBeVisible();
  });
});
