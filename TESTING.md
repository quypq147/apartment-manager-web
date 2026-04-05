# 🧪 Automation Testing Guide - Apartment Manager Web

Hướng dẫn chi tiết để thiết lập và chạy các kiểm thử tự động cho dự án Apartment Manager Web sử dụng **Playwright**.

---

## 📋 Mục Lục

1. [Thiết lập Ban Đầu](#thiết-lập-ban-đầu)
2. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
3. [Chạy Tests](#chạy-tests)
4. [Test Cases](#test-cases)
5. [Seed Data](#seed-data)
6. [Best Practices](#best-practices)

---

## ⚙️ Thiết lập Ban Đầu

### 1. Cài đặt Dependencies

Playwright đã được cài đặt trong dự án. Nếu chưa, chạy:

```bash
npm install -D @playwright/test
```

### 2. Cài đặt Trình Duyệt Test

```bash
npx playwright install chromium firefox
```

### 3. Kiểm tra Cấu Hình Playwright

File cấu hình: `playwright.config.ts`

```typescript
// Cấu hình cơ bản đã được thiết lập:
// - baseURL: http://localhost:3000
// - Hỗ trợ Chromium, Firefox
// - Auto-start dev server trước khi test
// - Screenshot/Video on failure
```

---

## 📁 Cấu Trúc Thư Mục

```
tests/
├── fixtures/
│   └── auth.ts                    # Auth fixtures (login, logout)
├── e2e/
│   ├── auth.spec.ts              # Test đăng nhập/đăng xuất
│   ├── owner-properties.spec.ts   # Test quản lý tài sản
│   ├── owner-invoices.spec.ts     # Test hợp đồng & hóa đơn
│   ├── tenant-invoices.spec.ts    # Test hóa đơn Tenant & Thanh toán
│   └── ai-chatbot.spec.ts         # Test AI & UI/UX
├── utils/
│   ├── seed.ts                    # Seed data generator
│   ├── seed-runner.ts             # Runner script
│   └── test-helpers.ts            # Helper functions
└── [results]/                     # Test report output
```

---

## 🚀 Chạy Tests

### Lệnh Cơ Bản

```bash
# Chạy tất cả tests (Headless mode)
npm test

# Chạy tests với giao diện trực quan (UI mode)
npm run test:ui

# Chạy tests ở chế độ debug
npm run test:debug

# Chạy tests với trình duyệt visible
npm run test:headed

# Xem báo cáo kiểm thử
npm run test:report
```

### Chạy Theo Module Cụ Thể

```bash
# Test Authentication
npm run test:auth

# Test Owner Features (Properties, Invoices, Contracts)
npm run test:owner

# Test Tenant Features
npm run test:tenant

# Test AI & Chatbot
npm run test:ai

# Chạy một test file cụ thể
npx playwright test tests/e2e/auth.spec.ts

# Chạy một test case cụ thể
npx playwright test tests/e2e/auth.spec.ts --grep "TC_AUTH_01"
```

---

## 📊 Test Cases

### Authentication Module (10+ test cases)

- ✅ **TC_AUTH_01**: Đăng nhập Owner
- ✅ **TC_AUTH_02**: Đăng nhập Tenant
- ✅ **TC_AUTH_03**: Đăng nhập Admin
- ✅ **TC_AUTH_04**: Sai mật khẩu
- ✅ **TC_AUTH_05**: Email không tồn tại
- ✅ **TC_AUTH_10**: Đăng xuất

### Owner - Properties (8+ test cases)

- ✅ **TC_OWN_PROP_01**: Xem danh sách tài sản
- ✅ **TC_OWN_PROP_02**: Thêm tài sản mới
- ✅ **TC_OWN_PROP_03**: Validation form (bỏ trống)
- ✅ **TC_OWN_PROP_04**: Chỉnh sửa tài sản
- ✅ **TC_EDGE_PROP_01**: Tìm kiếm
- ✅ **TC_EDGE_PROP_02**: Kiểm tra XSS

### Owner - Contracts (3 test cases)

- ✅ **TC_OWN_CON_01**: Tạo hợp đồng
- ✅ **TC_OWN_CON_02**: Xem chi tiết
- ✅ **TC_OWN_CON_03**: Chấm dứt hợp đồng

### Owner - Invoices (5+ test cases)

- ✅ **TC_OWN_INV_01**: Tạo hóa đơn
- ✅ **TC_OWN_INV_02**: Xác nhận thanh toán
- ✅ **TC_OWN_INV_03**: Phân trang
- ✅ **TC_EDGE_INV_01**: Lọc theo trạng thái

### Tenant - Dashboard & Invoices (6+ test cases)

- ✅ **TC_TEN_DASH_01**: Xem Dashboard
- ✅ **TC_TEN_ROOM_01**: Xem phòng đang thuê
- ✅ **TC_TEN_INV_01**: Xem hóa đơn
- ✅ **TC_TEN_INV_02**: Lọc hóa đơn
- ✅ **TC_TEN_INV_03**: Chi tiết hóa đơn

### Payment - VNPay (3 test cases)

- ✅ **TC_PAY_VN_01**: Mở coportal VNPay
- ✅ **TC_PAY_VN_02**: Log payment requests
- ✅ **TC_PAY_VN_03**: Mock successful response

### Authorization (3 test cases)

- ✅ **TC_AUTHZ_01**: Tenant không thể vào Owner dashboard
- ✅ **TC_AUTHZ_02**: Redirect khi chưa login
- ✅ **TC_AUTHZ_03**: Admin permissions

### AI & Chatbot (5 test cases)

- ✅ **TC_AI_01**: Mở Chatbot
- ✅ **TC_AI_02**: Gửi message & nhận response
- ✅ **TC_AI_03**: Mock AI response
- ✅ **TC_AI_04**: AI Overview
- ✅ **TC_EDGE_AI_01**: Special characters handling

### UI/UX (3 test cases)

- ✅ **TC_UI_01**: Dark/Light mode toggle
- ✅ **TC_UI_02**: Mobile responsive
- ✅ **TC_UI_03**: Notifications/Toast

**Tổng cộng: 50+ Test Cases** ✅

---

## 💾 Seed Data

### Tạo Dữ Liệu Test

Trước khi chạy tests, hãy seed dữ liệu test vào database:

```bash
npm run db:seed
```

**Dữ liệu được tạo:**

```
👤 Test Users:
  - Owner: owner_test@example.com (password: password123)
  - Tenant: tenant_test@example.com (password: password123)
  - Admin: admin_test@example.com (password: password123)

🏢 Property:
  - Khu Trọ Test - Automation

🚪 Rooms:
  - Phòng 101 (OCCUPIED - cho thuê)
  - Phòng 102 (VACANT - trống)

⚡ Services:
  - Điện (3500 VND/kWh)
  - Nước (5000 VND/m³)

📄 Contracts:
  - 1 hợp đồng ACTIVE

📋 Invoices:
  - 1 hóa đơn UNPAID
  - 1 hóa đơn PAID
```

### Manual Data Reset

Nếu cần reset database:

```bash
# Reset Prisma database
npx prisma migrate reset

# Hoặc chỉ xóa dữ liệu
npx prisma db push --skip-generate
```

---

## 🎯 Best Practices

### 1. Viết Test Cases

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Module Name', () => {
  test.beforeEach(async ({ loginAsOwner }) => {
    await loginAsOwner(); // Sử dụng fixture
  });

  test('TC_XXX_01: Mô tả test case', async ({ page }) => {
    // Arrange
    await page.goto('/path');

    // Act
    await page.click('button');

    // Assert
    await expect(page.locator('text')).toBeVisible();
  });
});
```

### 2. Sử dụng Fixtures

```typescript
// Sử dụng fixture auth
test('Example', async ({ loginAsOwner }) => {
  await loginAsOwner(); // Tự động login Owner
});
```

### 3. Chờ Elements Safely

```typescript
// ❌ Tránh: Chờ cứng
await page.waitForTimeout(5000);

// ✅ Nên: Chờ theo element hoặc URL
await page.locator('text=Success').waitFor({ state: 'visible' });
await page.waitForURL(/.*\/dashboard\/.*/);
```

### 4. Mock API Responses

```typescript
// Mock VNPay API
await page.route('**/api/vnpay/**', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true }),
  });
});
```

### 5. Chụp Screenshots & Videos

```bash
# Chụp screenshot on failure (mặc định)
npm test

# Xem video khi test fail
# Video sẽ được lưu trong thư mục test-results/
```

---

## 🐛 Troubleshooting

### 1. **Dev Server không start**

```bash
# Kiểm tra port 3000 có được sử dụng
netstat -ano | findstr :3000

# Hoặc start server trước
npm run dev
```

### 2. **Tests timeout**

```bash
# Tăng timeout
npx playwright test --timeout=60000

# Hoặc trong test file
test.setTimeout(60000);
```

### 3. **Element không tìm thấy**

```bash
# Dùng debug mode để xem chính xác
npx playwright test --debug

# Hoặc inspect element selector
await page.locator('text=Something').isVisible();
```

### 4. **Database seed fails**

```bash
# Kiểm tra .env file
# Đảm bảo DATABASE_URL được set đúng

# Clear Prisma cache
rm -rf node_modules/.prisma
npm install
```

---

## 📈 CI/CD Integration

### GitHub Actions

Tệp workflow tại: `.github/workflows/test.yml`

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run db:seed
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

---

## 📝 Ghi Chú

- Tests được thiết kế để **độc lập** với nhau (có thể chạy bất kỳ thứ tự nào)
- Mỗi test **tự động seed** dữ liệu cần thiết
- Hỗ trợ **Dark/Light mode**, **Mobile responsive**, **RBAC**
- **Mocking AI API** để tiết kiệm quota
- Tests chạy **headless** mặc định (nhanh hơn)

---

## 📞 Hỗ Trợ

Nếu có vấn đề:

1. Xem logs: `npm run test:debug`
2. Kiểm tra Playwright report: `npm run test:report`
3. Xem video failures: `test-results/`

---

**Happy Testing! 🎉**
