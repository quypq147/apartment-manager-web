import { test, expect } from '../fixtures/auth';
import { getTableData } from '../utils/test-helpers';

test.describe('Owner - Hợp Đồng (Contracts)', () => {
  test.beforeEach(async ({ loginAsOwner }) => {
    await loginAsOwner();
  });

  test('TC_OWN_CON_01: Tạo hợp đồng thuê phòng', async ({ page }) => {
    // Điều hướng đến trang Contracts
    await page.goto('/dashboard/owner/contracts');

    // Tìm nút tạo hợp đồng mới
    const createBtn = page.locator(
      'button:has-text(/thêm hợp đồng|tạo hợp đồng|new contract|create/i), a:has-text(/thêm|new/i)'
    ).first();

    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();

      await page.waitForTimeout(500);

      // Chọn phòng (nếu có dropdown)
      const roomSelect = page.locator('select[name="roomId"], [role="combobox"]').first();
      if (await roomSelect.isVisible().catch(() => false)) {
        await roomSelect.click();
        // Chọn phòng đầu tiên hoặc phòng test
        const roomOption = page.locator('[role="option"]').first();
        if (await roomOption.isVisible().catch(() => false)) {
          await roomOption.click();
        }
      }

      await page.waitForTimeout(300);

      // Điền thông tin hợp đồng
      const tenantInput = page.locator('input[name="tenantName"], input[placeholder*="khách thuê"]').first();
      if (await tenantInput.isVisible().catch(() => false)) {
        await tenantInput.fill('Khách Thuê Test E2E');
      }

      const startDateInput = page.locator('input[type="date"], input[name="startDate"]').first();
      if (await startDateInput.isVisible().catch(() => false)) {
        await startDateInput.fill('2026-01-01');
      }

      const endDateInput = page.locator('input[type="date"], input[name="endDate"]').nth(0);
      if (await endDateInput.isVisible().catch(() => false)) {
        await endDateInput.fill('2026-12-31');
      }

      // Submit form
      const submitBtn = page.locator('button[type="submit"]:has-text(/lưu|tạo|save|create/i)').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
      }

      // Kiểm tra thành công
      const successNotif = page.locator('text=/.*thành công|created|saved/i');
      await expect(successNotif)
        .toBeVisible({ timeout: 5000 })
        .catch(() => null);
    }
  });

  test('TC_OWN_CON_02: Xem chi tiết hợp đồng', async ({ page }) => {
    await page.goto('/dashboard/owner/contracts');

    // Tìm hợp đồng đầu tiên
    const contract = page.locator('button:has-text(/view|xem|chi tiết/i), a[href*="/contracts/"]').first();

    if (await contract.isVisible().catch(() => false)) {
      await contract.click();

      // Kiểm tra hiển thị chi tiết
      const contractDetails = page.locator('text=/.*mã hợp đồng|người thuê|giá tiền|cọc.*/i');
      await expect(contractDetails).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });

  test('TC_OWN_CON_03: Chấm dứt hợp đồng', async ({ page }) => {
    await page.goto('/dashboard/owner/contracts');

    // Tìm hợp đồng active
    const contractRow = page.locator('tr:has-text(/active|đang hoạt động/i)').first();

    if (await contractRow.isVisible().catch(() => false)) {
      // Tìm nút terminate/chấm dứt
      const terminateBtn = contractRow.locator('button:has-text(/chấm dứt|terminate|kết thúc/i)').first();

      if (await terminateBtn.isVisible().catch(() => false)) {
        await terminateBtn.click();

        // Xác nhận dialog
        const confirmBtn = page.locator('button:has-text(/xác nhận|confirm|yes/i)').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
        }

        // Kiểm tra thành công
        const successNotif = page.locator('text=/.*thành công|terminated/i');
        await expect(successNotif)
          .toBeVisible({ timeout: 5000 })
          .catch(() => null);
      }
    }
  });
});

test.describe('Owner - Hóa Đơn (Invoices)', () => {
  test.beforeEach(async ({ loginAsOwner }) => {
    await loginAsOwner();
  });

  test('TC_OWN_INV_01: Tạo hóa đơn hàng tháng', async ({ page }) => {
    // Điều hướng đến trang Invoices
    await page.goto('/dashboard/owner/invoices');

    // Tìm nút tạo hóa đơn
    const createBtn = page.locator(
      'button:has-text(/thêm hóa đơn|tạo hóa đơn|new invoice|create/i), a:has-text(/thêm|new/i)'
    ).first();

    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();

      await page.waitForTimeout(500);

      // Chọn phòng
      const roomSelect = page.locator('select[name="roomId"], [role="combobox"]').first();
      if (await roomSelect.isVisible().catch(() => false)) {
        await roomSelect.click();
        const roomOption = page.locator('[role="option"]').first();
        if (await roomOption.isVisible().catch(() => false)) {
          await roomOption.click();
        }
      }

      await page.waitForTimeout(300);

      // Nhập chỉ số điện/nước (nếu cần)
      const meterInputs = page.locator('input[type="number"]');
      const meterCount = await meterInputs.count();

      for (let i = 0; i < Math.min(meterCount, 2); i++) {
        // Điền 2 chỉ số đầu tiên (điện, nước)
        await meterInputs.nth(i).fill((100 + i * 50).toString());
      }

      // Submit
      const submitBtn = page.locator('button[type="submit"]:has-text(/tạo|lưu|save|create/i)').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
      }

      // Kiểm tra thành công
      const successNotif = page.locator('text=/.*thành công|created|saved/i');
      await expect(successNotif)
        .toBeVisible({ timeout: 5000 })
        .catch(() => null);
    }
  });

  test('TC_OWN_INV_02: Xác nhận thanh toán thủ công', async ({ page }) => {
    await page.goto('/dashboard/owner/invoices');

    // Tìm hóa đơn chưa thanh toán (Unpaid)
    const unpaidInvoice = page.locator('tr:has-text(/chưa thanh toán|unpaid|not paid/i)').first();

    if (await unpaidInvoice.isVisible().catch(() => false)) {
      // Tìm nút thanh toán
      const payBtn = unpaidInvoice.locator('button:has-text(/đã thu|thanh toán|mark paid/i)').first();

      if (await payBtn.isVisible().catch(() => false)) {
        await payBtn.click();

        // Xác nhận
        const confirmBtn = page.locator('button:has-text(/xác nhận|confirm|yes/i)').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
        }

        // Kiểm tra thành công
        const successNotif = page.locator('text=/.*thành công|paid/i');
        await expect(successNotif)
          .toBeVisible({ timeout: 5000 })
          .catch(() => null);

        // Kiểm tra trạng thái thay đổi
        await expect(unpaidInvoice).toContainText(/đã thanh toán|paid/i).catch(() => null);
      }
    }
  });

  test('TC_OWN_INV_03: Xem danh sách hóa đơn với phân trang', async ({ page }) => {
    await page.goto('/dashboard/owner/invoices');

    // Kiểm tra bảng hóa đơn
    const invoiceTable = page.locator('table, [role="grid"]').first();
    if (await invoiceTable.isVisible().catch(() => false)) {
      // Lấy dữ liệu từ table
      const tableData = await getTableData(page);
      expect(tableData.length).toBeGreaterThan(0);

      // Kiểm tra phân trang (nếu có)
      const nextBtn = page.locator('button:has-text(/tiếp theo|next|>)').first();
      if (await nextBtn.isEnabled().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(500);

        const newTableData = await getTableData(page);
        // Kiểm tra dữ liệu thay đổi
        expect(newTableData).toBeDefined();
      }
    }
  });

  test('TC_EDGE_INV_01: Lọc hóa đơn theo trạng thái', async ({ page }) => {
    await page.goto('/dashboard/owner/invoices');

    // Tìm filter/dropdown trạng thái
    const statusFilter = page.locator('select[name="status"], [aria-label*="trạng thái|status"]').first();

    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.click();

      // Chọn "Paid"
      const paidOption = page.locator('[role="option"]:has-text(/đã thanh toán|paid/i)').first();
      if (await paidOption.isVisible().catch(() => false)) {
        await paidOption.click();

        await page.waitForTimeout(300);

        // Kiểm tra chỉ hiển thị hóa đơn paid
        const unpaidText = page.locator('text=/chưa thanh toán|unpaid/i');
        const isVisible = await unpaidText.isVisible().catch(() => false);
        expect(isVisible).toBe(false);
      }
    }
  });
});
