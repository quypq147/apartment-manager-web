import { expect, test } from '../fixtures/auth';
import { getAuthHeaders, getFirstIdFromList } from './regression-utils';

test.describe('Regression API', () => {
  test('login validation rejects empty payload', async ({ request }) => {
    const response = await request.post('/api/auth/login', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('login validation rejects missing email', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { password: 'password123' },
    });
    expect(response.status()).toBe(400);
  });

  test('login validation rejects missing password', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'owner_test@example.com' },
    });
    expect(response.status()).toBe(400);
  });

  test('forgot password validation rejects empty payload', async ({ request }) => {
    const response = await request.post('/api/auth/forgot-password', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('register validation rejects empty payload', async ({ request }) => {
    const response = await request.post('/api/auth/register', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('change password requires auth', async ({ request }) => {
    const response = await request.post('/api/auth/change-password', {
      data: { currentPassword: 'password123', newPassword: 'newpassword123' },
    });
    expect(response.status()).toBe(401);
  });

  test('unauthorized properties API is blocked', async ({ request }) => {
    const response = await request.get('/api/properties');
    expect(response.status()).toBe(401);
  });

  test('unauthorized property detail API is blocked', async ({ request }) => {
    const response = await request.get('/api/properties/test-property-id');
    expect(response.status()).toBe(401);
  });

  test('unauthorized rooms API is blocked', async ({ request }) => {
    const response = await request.get('/api/rooms');
    expect(response.status()).toBe(401);
  });

  test('unauthorized contracts API is blocked', async ({ request }) => {
    const response = await request.get('/api/contracts');
    expect(response.status()).toBe(401);
  });

  test('unauthorized contract detail API is blocked', async ({ request }) => {
    const response = await request.get('/api/contracts/test-contract-id');
    expect(response.status()).toBe(401);
  });

  test('unauthorized invoices API is blocked', async ({ request }) => {
    const response = await request.get('/api/invoices');
    expect(response.status()).toBe(401);
  });

  test('unauthorized invoice detail API is blocked', async ({ request }) => {
    const response = await request.get('/api/invoices/test-invoice-id');
    expect(response.status()).toBe(401);
  });

  test('unauthorized services API is blocked', async ({ request }) => {
    const response = await request.get('/api/services');
    expect(response.status()).toBe(401);
  });

  test('unauthorized tenant dashboard API is blocked', async ({ request }) => {
    const response = await request.get('/api/tenant/dashboard');
    expect(response.status()).toBe(401);
  });

  test('unauthorized tenant invoices API is blocked', async ({ request }) => {
    const response = await request.get('/api/tenant/invoices');
    expect(response.status()).toBe(401);
  });

  test('unauthorized tenant notifications API is blocked', async ({ request }) => {
    const response = await request.get('/api/tenant/notifications');
    expect(response.status()).toBe(401);
  });

  test('unauthorized tenant contracts API is blocked', async ({ request }) => {
    const response = await request.get('/api/tenant/contracts');
    expect(response.status()).toBe(401);
  });

  test('unauthorized tenant services API is blocked', async ({ request }) => {
    const response = await request.get('/api/tenant/services');
    expect(response.status()).toBe(401);
  });

  test('unauthorized admin API is blocked', async ({ request }) => {
    const response = await request.get('/api/admin');
    expect(response.status()).toBe(401);
  });

  test('unauthorized admin users API is blocked', async ({ request }) => {
    const response = await request.get('/api/admin/users');
    expect(response.status()).toBe(401);
  });

  test('unauthorized admin landlords API is blocked', async ({ request }) => {
    const response = await request.get('/api/admin/landlords');
    expect(response.status()).toBe(401);
  });

  test('unauthorized admin landlord verify API is blocked', async ({ request }) => {
    const response = await request.patch('/api/admin/landlords/test-id/verify');
    expect(response.status()).toBe(401);
  });

  test('owner can read properties API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/properties', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('owner can create property through API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.post('/api/properties', {
      headers,
      data: {
        name: `API Property ${Date.now()}`,
        address: '123 API Street',
        description: 'Created by regression suite',
      },
    });

    expect([200, 201]).toContain(response.status());
  });

  test('owner can read property detail API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    const response = await page.request.get(`/api/properties/${propertyId}`, { headers });

    expect(response.status()).toBe(200);
  });

  test('owner can read contracts API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/contracts', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('owner can read contract detail API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const contractId = await getFirstIdFromList(page, '/api/tenants');
    const response = await page.request.get(`/api/contracts/${contractId}`, { headers });

    expect(response.status()).toBe(200);
  });

  test('owner can read invoices API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/invoices', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('owner can read invoice detail API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const invoiceId = await getFirstIdFromList(page, '/api/invoices');
    const response = await page.request.get(`/api/invoices/${invoiceId}`, { headers });

    expect(response.status()).toBe(200);
  });

  test('owner can read services API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/services', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('owner can create service through API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const propertyId = await getFirstIdFromList(page, '/api/properties');
    const response = await page.request.post('/api/services', {
      headers,
      data: {
        propertyId,
        name: `API Service ${Date.now()}`,
        unit: 'unit',
        price: 1000,
        isMetered: false,
      },
    });

    expect([200, 201]).toContain(response.status());
  });

  test('owner can read dashboard stats API', async ({ page, loginAsOwner }) => {
    await loginAsOwner();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/owner/dashboard-stats', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(typeof payload.data.totalRooms).toBe('number');
    expect(typeof payload.data.occupancyRate).toBe('number');
  });

  test('tenant can read dashboard API', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/tenant/dashboard', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveProperty('roomInfo');
    expect(Array.isArray(payload.data.unpaidInvoices)).toBeTruthy();
  });

  test('tenant can read invoices API', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/tenant/invoices', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('tenant can read contract list API', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/tenant/contracts', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('tenant can read contract detail API', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const contractId = await getFirstIdFromList(page, '/api/tenant/contracts');
    const response = await page.request.get(`/api/contracts/${contractId}`, { headers });

    expect(response.status()).toBe(200);
  });

  test('tenant can read services API', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/tenant/services', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('tenant can read notifications API', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/tenant/notifications', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('tenant chat API accepts message', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const response = await page.request.post('/api/chat', {
      headers,
      data: { message: 'hello' },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.success).toBeTruthy();
  });

  test('tenant chat GET endpoint is available', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/chat', { headers });

    expect(response.status()).toBe(200);
  });

  test('tenant can create VNPay payment url', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const invoiceId = await getFirstIdFromList(page, '/api/tenant/invoices');
    const response = await page.request.post(`/api/invoices/${invoiceId}/vnpay`, {
      headers,
      data: { redirectTo: 'dashboard' },
    });

    expect([200, 400]).toContain(response.status());
  });

  test('tenant payment endpoint is reachable', async ({ page, loginAsTenant }) => {
    await loginAsTenant();
    const headers = await getAuthHeaders(page);
    const invoiceId = await getFirstIdFromList(page, '/api/tenant/invoices');
    const response = await page.request.post(`/api/invoices/${invoiceId}/pay`, {
      headers,
      data: { amount: 1, paymentMethod: 'BANK_TRANSFER', reference: 'TEST' },
    });

    expect([200, 400]).toContain(response.status());
  });

  test('admin can read admin API', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/admin', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.success).toBeTruthy();
  });

  test('admin can read users API', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/admin/users', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('admin can read landlords API', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const headers = await getAuthHeaders(page);
    const response = await page.request.get('/api/admin/landlords', { headers });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data)).toBeTruthy();
  });

  test('admin landlord verify endpoint is reachable', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const headers = await getAuthHeaders(page);
    const landlordsResponse = await page.request.get('/api/admin/landlords', { headers });
    const landlordsPayload = await landlordsResponse.json();
    const landlordId = landlordsPayload?.data?.[0]?.id;

    if (typeof landlordId !== 'string') {
      throw new Error('No landlord id found');
    }

    const response = await page.request.patch(`/api/admin/landlords/${landlordId}/verify`, {
      headers,
    });

    expect([200, 400, 409]).toContain(response.status());
  });
});