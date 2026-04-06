import { test, expect } from '../fixtures/auth';

type Cookie = { name: string; value: string };

function getSession(cookies: Cookie[]) {
  const userId = cookies.find((c) => c.name === 'user_id')?.value ?? '';
  const userRole = cookies.find((c) => c.name === 'user_role')?.value ?? '';
  const cookieHeader = cookies
    .filter((c) => c.name === 'user_id' || c.name === 'user_role')
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  return { userId, userRole, cookieHeader };
}

test.describe('API regression', () => {
  test('unauthorized request blocked', async ({ request }) => {
    const res = await request.get('/api/properties');
    expect(res.status()).toBe(401);
  });

  test('owner APIs', async ({ page, request, loginAsOwner }) => {
    await loginAsOwner();
    const session = getSession(await page.context().cookies());

    const propertiesRes = await request.get('/api/properties', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(propertiesRes.status()).toBe(200);

    const createPropertyRes = await request.post('/api/properties', {
      headers: { Cookie: session.cookieHeader },
      data: {
        name: `API Property ${Date.now()}`,
        address: '123 API Street',
      },
    });
    expect(createPropertyRes.status()).toBe(200);

    const contractsRes = await request.get('/api/contracts', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(contractsRes.status()).toBe(200);

    const invoicesRes = await request.get('/api/invoices', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(invoicesRes.status()).toBe(200);

    const tenantsRes = await request.get('/api/tenants', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(tenantsRes.status()).toBe(200);
  });

  test('tenant APIs', async ({ page, request, loginAsTenant }) => {
    await loginAsTenant();
    const session = getSession(await page.context().cookies());

    const dashboardRes = await request.get('/api/tenant/dashboard', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(dashboardRes.status()).toBe(200);

    const invoicesRes = await request.get('/api/tenant/invoices', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(invoicesRes.status()).toBe(200);

    const notificationsRes = await request.get('/api/tenant/notifications', {
      headers: {
        Cookie: session.cookieHeader,
        'x-user-id': session.userId,
        'x-user-role': session.userRole,
      },
    });
    expect(notificationsRes.status()).toBe(200);

    const chatPostRes = await request.post('/api/chat', {
      headers: { Cookie: session.cookieHeader },
      data: { message: 'hello' },
    });
    expect(chatPostRes.status()).toBe(200);

    const chatGetRes = await request.get('/api/chat', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(chatGetRes.status()).toBe(200);
  });

  test('admin APIs', async ({ page, request, loginAsAdmin }) => {
    await loginAsAdmin();
    const session = getSession(await page.context().cookies());

    const adminRes = await request.get('/api/admin', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(adminRes.status()).toBe(200);

    const landlordsRes = await request.get('/api/admin/landlords', {
      headers: { Cookie: session.cookieHeader },
    });
    expect(landlordsRes.status()).toBe(200);

    const payload = await landlordsRes.json();
    const landlordId = payload?.data?.[0]?.id;
    expect(typeof landlordId).toBe('string');

    const verifyRes = await request.patch(`/api/admin/landlords/${landlordId}/verify`, {
      headers: { Cookie: session.cookieHeader },
    });
    expect(verifyRes.status()).toBe(200);
  });
});
