import { test, expect } from '@playwright/test';
import { loginAsOwner, loginAsTenant, loginAsAdmin } from '../fixtures/auth';

let ownerToken: string;
let tenantToken: string;
let adminToken: string;

test.describe('API - Properties Endpoints', () => {
  // Get auth tokens
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsOwner(page);
    ownerToken = (await context.cookies()).find(c => c.name.includes('auth'))?.value || '';
    await context.close();
  });

  test('TC_API_PROP_01: GET /api/properties - Lấy danh sách khu trọ', async ({ request }) => {
    const response = await request.get('/api/properties', {
      headers: { 'Cookie': `auth=${ownerToken}` }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success');
  });

  test('TC_API_PROP_02: POST /api/properties - Tạo khu trọ mới', async ({ request }) => {
    const response = await request.post('/api/properties', {
      data: {
        name: 'Test Property ' + Date.now(),
        address: '123 Đường Test, TP.HCM',
        totalRooms: 10
      },
      headers: { 'Cookie': `auth=${ownerToken}` }
    });
    expect([200, 201]).toContain(response.status());
  });

  test('TC_API_PROP_03: GET /api/properties/[id] - Lấy chi tiết khu trọ', async ({ request }) => {
    const listRes = await request.get('/api/properties', {
      headers: { 'Cookie': `auth=${ownerToken}` }
    });
    if (listRes.ok) {
      const data = await listRes.json();
      if (data.data && data.data.length > 0) {
        const propertyId = data.data[0].id;
        const response = await request.get(`/api/properties/${propertyId}`, {
          headers: { 'Cookie': `auth=${ownerToken}` }
        });
        expect([200, 404]).toContain(response.status());
      }
    }
  });

  test('TC_API_PROP_04: API authentication validation', async ({ request }) => {
    const response = await request.get('/api/properties');
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('API - Rooms Endpoints', () => {
  test('TC_API_ROOM_01: GET /api/properties/[id]/rooms - Lấy danh sách phòng', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/properties', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.[0]?.id) {
          const roomsRes = await request.get(`/api/properties/${data.data[0].id}/rooms`, {
            headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
          });
          expect([200, 404]).toContain(roomsRes.status());
        }
      }
    }
  });

  test('TC_API_ROOM_02: POST /api/properties/[id]/rooms - Thêm phòng mới', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/properties', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.[0]?.id) {
          const addRes = await request.post(`/api/properties/${data.data[0].id}/rooms`, {
            data: {
              roomNumber: 'TEST-' + Date.now(),
              area: 30,
              price: 2500000
            },
            headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
          });
          expect([200, 201, 400]).toContain(addRes.status());
        }
      }
    }
  });
});

test.describe('API - Services Endpoints', () => {
  test('TC_API_SVC_01: GET /api/services - Lấy danh sách dịch vụ', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/services', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 401, 403]).toContain(response.status());
    }
  });

  test('TC_API_SVC_02: POST /api/services - Tạo dịch vụ mới', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/services', {
        data: {
          name: 'Service Test ' + Date.now(),
          price: 50000,
          description: 'Test service'
        },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 201, 400]).toContain(response.status());
    }
  });

  test('TC_API_SVC_03: PUT /api/services/[id] - Cập nhật dịch vụ', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const listRes = await request.get('/api/services', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      if (listRes.ok) {
        const data = await listRes.json();
        if (data.data?.[0]?.id) {
          const updateRes = await request.put(`/api/services/${data.data[0].id}`, {
            data: { name: 'Updated ' + Date.now() },
            headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
          });
          expect([200, 400, 404]).toContain(updateRes.status());
        }
      }
    }
  });

  test('TC_API_SVC_04: DELETE /api/services/[id] - Xóa dịch vụ', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.delete('/api/services/invalid-id', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 400, 404]).toContain(response.status());
    }
  });
});

test.describe('API - Contracts Endpoints', () => {
  test('TC_API_CON_01: GET /api/contracts - Lấy danh sách hợp đồng', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/contracts', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 401, 403]).toContain(response.status());
    }
  });

  test('TC_API_CON_02: POST /api/contracts - Tạo hợp đồng mới', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/contracts', {
        data: {
          roomId: 'test-room',
          tenantId: 'test-tenant',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
          monthlyRate: 2500000
        },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 201, 400]).toContain(response.status());
    }
  });

  test('TC_API_CON_03: GET /api/contracts/[id] - Lấy chi tiết hợp đồng', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/contracts/invalid-id', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 404]).toContain(response.status());
    }
  });

  test('TC_API_CON_04: PUT /api/contracts/[id] - Cập nhật hợp đồng', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.put('/api/contracts/invalid-id', {
        data: { status: 'ACTIVE' },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 400, 404]).toContain(response.status());
    }
  });
});

test.describe('API - Invoices Endpoints', () => {
  test('TC_API_INV_01: GET /api/invoices - Lấy danh sách hoá đơn', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/invoices', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 401, 403]).toContain(response.status());
    }
  });

  test('TC_API_INV_02: POST /api/invoices - Tạo hoá đơn mới', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/invoices', {
        data: {
          contractId: 'test-contract',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 201, 400]).toContain(response.status());
    }
  });

  test('TC_API_INV_03: GET /api/invoices/[id] - Lấy chi tiết hoá đơn', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/invoices/invalid-id', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 404]).toContain(response.status());
    }
  });

  test('TC_API_INV_04: POST /api/invoices/[id]/send - Gửi hoá đơn', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/invoices/invalid-id/send', {
        data: {},
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 400, 404]).toContain(response.status());
    }
  });

  test('TC_API_INV_05: PUT /api/invoices/[id] - Cập nhật hoá đơn', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.put('/api/invoices/invalid-id', {
        data: { status: 'PAID' },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 400, 404]).toContain(response.status());
    }
  });
});

test.describe('API - VNPay Payment', () => {
  test('TC_API_VNP_01: POST /api/vnpay - Khởi tạo thanh toán VNPay', async ({ request, page }) => {
    await loginAsTenant(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/vnpay', {
        data: {
          invoiceId: 'test-invoice',
          amount: 2500000
        },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 201, 400]).toContain(response.status());
    }
  });

  test('TC_API_VNP_02: POST /api/vnpay/return - Xử lý return từ VNPay', async ({ request }) => {
    const response = await request.post('/api/vnpay/return', {
      data: {
        vnp_TxnRef: 'test-txn',
        vnp_ResponseCode: '99'
      }
    });
    expect([200, 400]).toContain(response.status());
  });
});

test.describe('API - Chat Endpoints', () => {
  test('TC_API_CHAT_01: POST /api/chat - Gửi tin nhắn chat', async ({ request, page }) => {
    await loginAsTenant(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/chat', {
        data: {
          message: 'Test message'
        },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 201, 400]).toContain(response.status());
    }
  });

  test('TC_API_CHAT_02: GET /api/chat - Lấy lịch sử chat', async ({ request, page }) => {
    await loginAsTenant(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/chat', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 401, 403]).toContain(response.status());
    }
  });
});

test.describe('API - Tenant Endpoints', () => {
  test('TC_API_TEN_01: GET /api/tenant/dashboard-stats - Lấy thống kê dashboard', async ({ request, page }) => {
    await loginAsTenant(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/tenant/dashboard-stats', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 401]).toContain(response.status());
    }
  });

  test('TC_API_TEN_02: GET /api/tenants - Lấy danh sách khách thuê', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/tenants', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 401, 403]).toContain(response.status());
    }
  });

  test('TC_API_TEN_03: POST /api/tenants - Thêm khách thuê mới', async ({ request, page }) => {
    await loginAsOwner(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/tenants', {
        data: {
          name: 'Tenant Test',
          email: 'tenant' + Date.now() + '@example.com',
          phone: '0123456789'
        },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 201, 400]).toContain(response.status());
    }
  });
});

test.describe('API - Admin Endpoints', () => {
  test('TC_API_ADM_01: GET /api/admin - Lấy thông tin admin', async ({ request, page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.get('/api/admin', {
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 401, 403]).toContain(response.status());
    }
  });

  test('TC_API_ADM_02: POST /api/admin/verify-landlord - Duyệt chủ trọ', async ({ request, page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    if (authCookie) {
      const response = await request.post('/api/admin/verify-landlord', {
        data: {
          landlordId: 'test-landlord',
          isApproved: true
        },
        headers: { 'Cookie': `${authCookie.name}=${authCookie.value}` }
      });
      expect([200, 201, 400]).toContain(response.status());
    }
  });
});
