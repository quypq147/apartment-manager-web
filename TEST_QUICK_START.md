# Quick Start Guide - Kiểm Thử Tự Động

Dưới đây là các bước nhanh để bắt đầu chạy tests.

## ⚡ 60-Giây Setup

```bash
# 1. Cài đặt dependencies (chỉ lần đầu)
npm install

# 2. Cài đặt browser cho Playwright
npx playwright install

# 3. Seed dữ liệu test
npm run db:seed

# 4. Start dev server (terminal 1)
npm run dev

# 5. Chạy tests (terminal 2)
npm test
```

## 🎯 Lệnh Thường Dùng

```bash
# Chạy tất cả tests
npm test

# Chạy tests với UI (xem nó chạy)
npm run test:ui

# Chạy tests ở chế độ debug
npm run test:debug

# Xem báo cáo
npm run test:report

# Chạy test cụ thể
npm run test:auth
npm run test:owner
npm run test:tenant
npm run test:ai
```

## 🔍 Test Credentials

```
Owner:
  Email: owner_test@example.com
  Password: password123

Tenant:
  Email: tenant_test@example.com
  Password: password123

Admin:
  Email: admin_test@example.com
  Password: password123
```

## 📊 Cây Thư Mục Tests

```
tests/
├── fixtures/auth.ts                    # Login fixtures
├── e2e/
│   ├── auth.spec.ts                   # ~15 tests
│   ├── owner-properties.spec.ts        # ~10 tests
│   ├── owner-invoices.spec.ts          # ~8 tests
│   ├── tenant-invoices.spec.ts         # ~10 tests
│   └── ai-chatbot.spec.ts             # ~8 tests
├── utils/
│   ├── seed.ts                        # Tạo test data
│   ├── test-helpers.ts                # Helper functions
│   └── seed-runner.ts                 # CLI runner
└── playwright.config.ts               # Cấu hình Playwright
```

## ✅ Checklist Trước Chạy Test

- [ ] Node.js 18+ đã cài
- [ ] Dependencies: `npm install`
- [ ] Playwright browsers: `npx playwright install`
- [ ] .env file được setup
- [ ] Database migration: `npx prisma migrate dev`
- [ ] Seed data: `npm run db:seed`
- [ ] Dev server: `npm run dev` (hoặc để auto-start)

## 🚀 Workflow Khuyên Dùng

1. **Lần Đầu Setup**
   ```bash
   npm install
   npx playwright install
   npx prisma migrate dev
   npm run db:seed
   ```

2. **Phát Triển Tests**
   ```bash
   npm run test:ui
   # Sửa test, auto-reload khi lưu
   ```

3. **Chạy Trước Commit**
   ```bash
   npm test
   ```

4. **Xem Report**
   ```bash
   npm run test:report
   ```

## 💡 Tips

- Tests chạy **song song** mặc định (nhanh hơn)
- Mỗi test **độc lập** - có thể chạy riêng
- **Headless mode** nhanh hơn (default), dùng `--headed` để xem
- Mock AI API để tiết kiệm quota
- Debug mode: `npm run test:debug`

## 📝 File Quan Trọng

| File | Mục Đích |
|------|----------|
| `playwright.config.ts` | Cấu hình Playwright |
| `tests/fixtures/auth.ts` | Login helpers |
| `tests/utils/seed.ts` | Tạo test data |
| `TESTING.md` | Full documentation |

---

**Chi tiết xem:** [TESTING.md](TESTING.md)
