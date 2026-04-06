import { expect, test as base } from '@playwright/test';

interface AuthFixture {
  loginAsOwner: () => Promise<void>;
  loginAsTenant: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAs: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

async function doLogin(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  targetPath: string
) {
  await page.context().clearCookies();

  let response: import('@playwright/test').APIResponse | null = null;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await page.request.post('/api/auth/login', {
        data: { email, password },
      });
      if (response.ok()) {
        break;
      }
      lastError = new Error(`Login API failed: ${response.status()} ${response.statusText()}`);
    } catch (error) {
      lastError = error;
    }
  }

  if (!response || !response.ok()) {
    throw lastError instanceof Error ? lastError : new Error(`Login failed for ${email}`);
  }

  await page.goto(targetPath, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp(targetPath), { timeout: 20000 });
}

export const test = base.extend<AuthFixture>({
  loginAsOwner: async ({ page }, use) => {
    await use(async () => {
      await doLogin(page, 'owner_test@example.com', 'password123', '/dashboard/owner');
    });
  },

  loginAsTenant: async ({ page }, use) => {
    await use(async () => {
      await doLogin(page, 'tenant_test@example.com', 'password123', '/dashboard/tenant');
    });
  },

  loginAsAdmin: async ({ page }, use) => {
    await use(async () => {
      await doLogin(page, 'admin_test@example.com', 'password123', '/dashboard/admin');
    });
  },

  loginAs: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      await doLogin(page, email, password, '/dashboard');
    });
  },

  logout: async ({ page }, use) => {
    await use(async () => {
      await page.request.post('/api/auth/logout');
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
    });
  },
});

export { expect } from '@playwright/test';
