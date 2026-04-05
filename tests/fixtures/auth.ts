import { test as base, Page } from '@playwright/test';

type AuthRole = 'owner' | 'tenant' | 'admin';

interface AuthFixture {
  loginAsOwner: () => Promise<void>;
  loginAsTenant: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAs: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const test = base.extend<AuthFixture>({
  loginAsOwner: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'owner_test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*\/dashboard\/owner.*/);
    };
    await use(login);
  },

  loginAsTenant: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'tenant_test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*\/dashboard\/tenant.*/);
    };
    await use(login);
  },

  loginAsAdmin: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'admin_test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*\/dashboard\/admin.*/);
    };
    await use(login);
  },

  loginAs: async ({ page }, use) => {
    const login = async (email: string, password: string) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      // Chờ cho tới khi mở được dashboard (bất kỳ loại nào)
      await page.waitForURL(/.*\/dashboard\/.*/);
    };
    await use(login);
  },

  logout: async ({ page }, use) => {
    const logout = async () => {
      // Click avatar/menu dropdown
      await page.click('[role="button"]:has-text("Menu tài khoản")', { timeout: 5000 }).catch(() => null);
      // Hoặc tìm cách logout khác, ví dụ navigate trực tiếp
      await page.goto('/api/auth/logout', { waitUntil: 'networkidle' }).catch(() => null);
      await page.goto('/login');
    };
    await use(logout);
  },
});

export { expect } from '@playwright/test';
