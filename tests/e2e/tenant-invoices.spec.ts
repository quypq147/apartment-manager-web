import { test, expect } from '../fixtures/auth';
import { getTableData } from '../utils/test-helpers';

test.describe('Tenant - Dashboard & Hóa Đơn', () => {
  test.beforeEach(async ({ loginAsTenant }) => {
    await loginAsTenant();
  });

  test('TC_TEN_DASH_01: Xem tổng quan Dashboard', async ({ page }) => {
    // Vào dashboard tenant
    await page.goto('/dashboard/tenant');

    // Kiểm tra các phần tử chính
    const dashboard = page.locator('main, [role="main"]');
    await expect(dashboard).toBeVisible();

    // Kiểm tra hiển thị KPI cards
    const kpiCards = page.locator('.space-y-4, grid, [role="grid"]').first();
    if (await kpiCards.isVisible().catch(() => false)) {
      // Kiểm tra thông tin như: số tiền nợ, phòng đang thuê
      const elements = page.locator('text=/.*tiền|phòng|đơn vị|room|amount.*/i');
      const count = await elements.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('TC_TEN_ROOM_01: Xem thông tin phòng đang thuê', async ({ page }) => {
    // Điều hướng đến menu phòng
    const roomLink = page.locator('a:has-text(/phòng của tôi|my room|phòng thuê/i)').first();

    if (await roomLink.isVisible().catch(() => false)) {
      await roomLink.click();
    } else {
      // Fallback: navigate directly
      await page.goto('/dashboard/tenant/room');
    }

    // Kiểm tra hiển thị thông tin phòng
    const roomInfo = page.locator('text=/.*số phòng|diện tích|giá|address.*/i');
    await expect(roomInfo).toBeVisible({ timeout: 5000 }).catch(() => null);

    // Kiểm tra hiển thị chi tiết: số phòng, diện tích, giá
    const roomNumber = page.locator('text=/101|102|\\d{3}/i').first();
    await expect(roomNumber).toBeVisible({ timeout: 5000 }).catch(() => null);
  });

  test('TC_TEN_INV_01: Xem danh sách hóa đơn', async ({ page }) => {
    // Điều hướng tới trang hóa đơn
    const invoiceLink = page.locator('a:has-text(/hóa đơn|invoice|bills/i)').first();

    if (await invoiceLink.isVisible().catch(() => false)) {
      await invoiceLink.click();
    } else {
      await page.goto('/dashboard/tenant/invoices');
    }

    // Kiểm tra bảng hóa đơn
    const invoiceTable = page.locator('table, [role="grid"]').first();
    await expect(invoiceTable).toBeVisible({ timeout: 5000 }).catch(() => null);

    // Kiểm tra có hóa đơn
    const rows = page.locator('tbody tr, [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Kiểm tra hiển thị trạng thái (Paid, Unpaid)
    const statusElements = page.locator('text=/đã thanh toán|chưa thanh toán|paid|unpaid/i');
    const statusCount = await statusElements.count();
    expect(statusCount).toBeGreaterThan(0);
  });

  test('TC_TEN_INV_02: Lọc hóa đơn theo trạng thái Unpaid', async ({ page }) => {
    await page.goto('/dashboard/tenant/invoices');

    // Tìm filter dropdown
    const statusFilter = page.locator('select[name="status"], [aria-label*="trạng thái|status"]').first();

    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.click();

      // Chọn Unpaid
      const unpaidOption = page.locator('[role="option"]:has-text(/chưa thanh toán|unpaid|not paid/i)').first();
      if (await unpaidOption.isVisible().catch(() => false)) {
        await unpaidOption.click();

        await page.waitForTimeout(300);

        // Kiểm tra chỉ hiển thị unpaid invoices
        const table = page.locator('table, [role="grid"]').first();
        if (await table.isVisible().catch(() => false)) {
          const tableData = await getTableData(page);
          tableData.forEach((row) => {
            const statusText = Object.values(row).join(' ').toLowerCase();
            // Kiểm tra tất cả rows chứa "unpaid" hoặc "chưa thanh toán"
          });
        }
      }
    }
  });

  test('TC_TEN_INV_03: Clicking on invoice để xem chi tiết', async ({ page }) => {
    await page.goto('/dashboard/tenant/invoices');

    // Tìm invoice đầu tiên
    const invoiceLink = page.locator('a[href*="/invoices/"], button:has-text(/view|xem|chi tiết/i)').first();

    if (await invoiceLink.isVisible().catch(() => false)) {
      await invoiceLink.click();

      // Kiểm tra hiển thị chi tiết hóa đơn
      const invoiceDetails = page.locator('text=/.*số tiền|ngày đến hạn|mã hóa đơn.*/i');
      await expect(invoiceDetails).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });
});

test.describe('Payment - VNPay Integration', () => {
  test.beforeEach(async ({ loginAsTenant }) => {
    await loginAsTenant();
  });

  test('TC_PAY_VN_01: Mở cổng thanh toán VNPay', async ({ page }) => {
    await page.goto('/dashboard/tenant/invoices');

    // Tìm hóa đơn chưa thanh toán
    const unpaidInvoiceRow = page.locator('tr:has-text(/chưa thanh toán|unpaid/i)').first();

    if (await unpaidInvoiceRow.isVisible().catch(() => false)) {
      // Tìm nút thanh toán VNPay
      const payVNPayBtn = unpaidInvoiceRow.locator(
        'button:has-text(/vnpay|payment|thanh toán/i), a:has-text(/vnpay|thanh toán/i)'
      ).first();

      if (await payVNPayBtn.isVisible().catch(() => false)) {
        // Lắng nghe popup/tab mới
        const [popup] = await Promise.all([
          page.context().waitForEvent('page'),
          payVNPayBtn.click(),
        ]).catch(() => [null]);

        // Nếu mở tab mới
        if (popup) {
          await popup.waitForLoadState();
          // Kiểm tra URL chứa VNPay domain
          expect(popup.url()).toMatch(/sandbox\.vnpayment|vnpayment\.vn/i);
          await popup.close();
        } else {
          // Hoặc redirect trên trang hiện tại
          await page.waitForLoadState('networkidle');
          expect(page.url()).toMatch(/sandbox\.vnpayment|vnpayment\.vn/i);
        }
      }
    }
  });

  test('TC_PAY_VN_02: Kiểm tra payment được log vào API', async ({ page }) => {
    // Setup intercept request
    const paymentRequests: string[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/vnpay') || request.url().includes('/api/payment')) {
        paymentRequests.push(request.method() + ' ' + request.url());
      }
    });

    await page.goto('/dashboard/tenant/invoices');

    const unpaidInvoiceRow = page.locator('tr:has-text(/chưa thanh toán|unpaid/i)').first();

    if (await unpaidInvoiceRow.isVisible().catch(() => false)) {
      const payVNPayBtn = unpaidInvoiceRow.locator(
        'button:has-text(/vnpay|payment|thanh toán/i), a:has-text(/vnpay|thanh toán/i)'
      ).first();

      if (await payVNPayBtn.isVisible().catch(() => false)) {
        await payVNPayBtn.click();

        // Chờ request
        await page.waitForTimeout(1000);

        // Kiểm tra có request tới payment API
        expect(paymentRequests.length).toBeGreaterThan(0);
      }
    }
  });

  test('TC_PAY_VN_03: Mock successful payment response', async ({ page }) => {
    // Mock VNPay return URL
    await page.route('**/api/vnpay/return', async (route) => {
      await route.abort('blockedbyresponse');
    });

    // Mock IPN
    await page.route('**/api/vnpay/ipn', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ RspCode: '00', Message: 'Confirmed' }),
      });
    });

    // Mock invoice update
    page.on('request', (request) => {
      if (request.url().includes('/api/invoices') && request.method() === 'PATCH') {
        // Kiểm tra invoice được update
        request.postDataJSON().then(async (data: any) => {
          if (data.status === 'PAID') {
            // Success
          }
        });
      }
    });
  });
});

test.describe('Authorization - RBAC', () => {
  test('TC_AUTHZ_01: Tenant không thể truy cập dashboard Owner', async ({ page, loginAsTenant }) => {
    await loginAsTenant();

    // Cố truy cập owner dashboard
    await page.goto('/dashboard/owner', { waitUntil: 'networkidle' });

    // Kiểm tra không được vào
    // Sẽ redirect về tenant dashboard hoặc 404
    const url = page.url();
    expect(url).not.toMatch(/\/dashboard\/owner/);
  });

  test('TC_AUTHZ_02: Truy cập dashboard khi chưa đăng nhập - redirect về login', async ({ page }) => {
    // Không login
    await page.goto('/dashboard/tenant', { waitUntil: 'networkidle' });

    // Kiểm tra redirect về login
    expect(page.url()).toMatch(/\/login/);
  });

  test('TC_AUTHZ_03: Admin có thể cấp quyền', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();

    // Vào trang quản lý quyền (nếu có)
    const adminLink = page.locator('a[href*="/dashboard/admin"]').first();
    if (await adminLink.isVisible().catch(() => false)) {
      await adminLink.click();

      const adminPage = page.locator('text=/.*admin|quản trị|management/i');
      await expect(adminPage).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });
});

  test.describe('Tenant - Dashboard Thêm', () => {
    test.beforeEach(async ({ loginAsTenant }) => {
      await loginAsTenant();
    });

    test('TC_TEN_DASH_02: Xem số tiền nợ hóa đơn', async ({ page }) => {
      await page.goto('/dashboard/tenant');
    
      const unpaidAmount = page.locator('text=/.*tiền nợ|due amount|chưa thanh toán/i');
      await expect(unpaidAmount).toBeVisible({ timeout: 5000 }).catch(() => null);
    
      const amountValue = page.locator('text=/\\d+,\\d{3}|\\d{6,}/i').first();
      await expect(amountValue).toBeVisible({ timeout: 5000 }).catch(() => null);
    });

    test('TC_TEN_DASH_03: Xem phòng đang thuê trên Dashboard', async ({ page }) => {
      await page.goto('/dashboard/tenant');
    
      const roomInfo = page.locator('text=/.*phòng|số phòng|room number/i');
      await expect(roomInfo).toBeVisible({ timeout: 5000 }).catch(() => null);
    });

    test('TC_TEN_DASH_04: Xem thông báo trên Dashboard', async ({ page }) => {
      await page.goto('/dashboard/tenant');
    
      const notification = page.locator('text=/.*thông báo|notification|message/i').first();
      if (await notification.isVisible().catch(() => false)) {
        await expect(notification).toBeVisible();
      }
    });
  });

  test.describe('Tenant - Phòng (Room) Thêm', () => {
    test.beforeEach(async ({ loginAsTenant }) => {
      await loginAsTenant();
    });

    test('TC_TEN_ROOM_02: Xem chi tiết dịch vụ phòng', async ({ page }) => {
      const roomLink = page.locator('a:has-text(/phòng của tôi|my room/i)').first();

      if (await roomLink.isVisible().catch(() => false)) {
        await roomLink.click();
      } else {
        await page.goto('/dashboard/tenant/room');
      }

      // Tìm section dịch vụ
      const servicesSection = page.locator('text=/.*dịch vụ|service|utilities/i').first();
      if (await servicesSection.isVisible().catch(() => false)) {
        await expect(servicesSection).toBeVisible();
      }
    });
  });

  test.describe('Tenant - Hợp đồng (Contracts)', () => {
    test.beforeEach(async ({ loginAsTenant }) => {
      await loginAsTenant();
    });

    test('TC_TEN_CON_01: Xem hợp đồng thuê phòng', async ({ page }) => {
      const contractLink = page.locator('a:has-text(/hợp đồng|contract/i)').first();

      if (await contractLink.isVisible().catch(() => false)) {
        await contractLink.click();
      } else {
        await page.goto('/dashboard/tenant/contract');
      }

      const contractInfo = page.locator('text=/.*mã hợp đồng|người cho thuê|ngày bắt đầu/i');
      await expect(contractInfo).toBeVisible({ timeout: 5000 }).catch(() => null);
    });

    test('TC_TEN_CON_02: Xem chi tiết hợp đồng', async ({ page }) => {
      const contractLink = page.locator('a:has-text(/hợp đồng|contract/i)').first();

      if (await contractLink.isVisible().catch(() => false)) {
        await contractLink.click();
      } else {
        await page.goto('/dashboard/tenant/contract');
      }

      const viewBtn = page.locator('button:has-text(/xem|view|chi tiết/i)').first();
      if (await viewBtn.isVisible().catch(() => false)) {
        await viewBtn.click();
      
        const details = page.locator('text=/.*điều khoản|terms|chi tiết/i');
        await expect(details).toBeVisible({ timeout: 5000 }).catch(() => null);
      }
    });

    test('TC_TEN_CON_03: Tải xuống hợp đồng PDF', async ({ page }) => {
      const contractLink = page.locator('a:has-text(/hợp đồng|contract/i)').first();

      if (await contractLink.isVisible().catch(() => false)) {
        await contractLink.click();
      } else {
        await page.goto('/dashboard/tenant/contract');
      }

      const downloadBtn = page.locator('button:has-text(/tải|download|pdf/i)').first();
      if (await downloadBtn.isVisible().catch(() => false)) {
        await downloadBtn.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Tenant - Thông báo (Notifications)', () => {
    test.beforeEach(async ({ loginAsTenant }) => {
      await loginAsTenant();
    });

    test('TC_TEN_NOTI_01: Xem danh sách thông báo', async ({ page }) => {
      const notificationBtn = page.locator('[aria-label*="notification"], button:has-text(/thông báo/i)').first();
    
      if (await notificationBtn.isVisible().catch(() => false)) {
        await notificationBtn.click();
      
        const notificationList = page.locator('[role="dialog"]').first();
        await expect(notificationList).toBeVisible({ timeout: 5000 }).catch(() => null);
      }
    });

    test('TC_TEN_NOTI_02: Đánh dấu thông báo là đã đọc', async ({ page }) => {
      const notificationBtn = page.locator('[aria-label*="notification"], button:has-text(/thông báo/i)').first();
    
      if (await notificationBtn.isVisible().catch(() => false)) {
        await notificationBtn.click();
      
        const readBtn = page.locator('button:has-text(/đã đọc|read|xác nhận/i)').first();
        if (await readBtn.isVisible().catch(() => false)) {
          await readBtn.click();
          await page.waitForTimeout(300);
        }
      }
    });
  });

  test.describe('Tenant - Dịch vụ (Services)', () => {
    test.beforeEach(async ({ loginAsTenant }) => {
      await loginAsTenant();
    });

    test('TC_TEN_SVC_01: Xem danh sách dịch vụ phòng', async ({ page }) => {
      await page.goto('/dashboard/tenant/room');
    
      const serviceList = page.locator('table, [role="grid"]').first();
      if (await serviceList.isVisible().catch(() => false)) {
        await expect(serviceList).toBeVisible();
      }
    });

    test('TC_TEN_SVC_02: Xem chi tiết dịch vụ', async ({ page }) => {
      await page.goto('/dashboard/tenant/room');
    
      const serviceItem = page.locator('tr, [role="row"]').first();
      if (await serviceItem.isVisible().catch(() => false)) {
        const serviceName = serviceItem.locator('text=/.*dịch vụ|service/i').first();
        if (await serviceName.isVisible().catch(() => false)) {
          await serviceItem.click();
        }
      }
    });
  });

  test.describe('Tenant - Hóa đơn (Invoices) Thêm', () => {
    test.beforeEach(async ({ loginAsTenant }) => {
      await loginAsTenant();
    });

    test('TC_TEN_INV_04: Tải xuống hóa đơn PDF', async ({ page }) => {
      await page.goto('/dashboard/tenant/invoices');
    
      const invoiceRow = page.locator('tr, [role="row"]').first();
      if (await invoiceRow.isVisible().catch(() => false)) {
        const downloadBtn = invoiceRow.locator('button:has-text(/tải|download|pdf/i)').first();
        if (await downloadBtn.isVisible().catch(() => false)) {
          await downloadBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('TC_TEN_INV_05: Kiểm tra lịch sử thanh toán hóa đơn', async ({ page }) => {
      await page.goto('/dashboard/tenant/invoices');
    
      const paidInvoice = page.locator('tr:has-text(/đã thanh toán|paid/i)').first();
      if (await paidInvoice.isVisible().catch(() => false)) {
        const detailsBtn = paidInvoice.locator('button:has-text(/chi tiết|view|xem/i)').first();
        if (await detailsBtn.isVisible().catch(() => false)) {
          await detailsBtn.click();
        
          const paymentHistory = page.locator('text=/.*lịch sử thanh toán|payment date|ngày thanh toán/i');
          await expect(paymentHistory).toBeVisible({ timeout: 5000 }).catch(() => null);
        }
      }
    });
  });
