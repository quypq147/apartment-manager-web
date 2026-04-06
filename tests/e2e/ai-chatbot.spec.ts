import { test, expect } from '../fixtures/auth';

test.describe('AI chatbot and settings smoke', () => {
  test.beforeEach(async ({ loginAsOwner }) => {
    await loginAsOwner();
  });

  test('chat widget opens', async ({ page }) => {
    await page.goto('/dashboard/owner');
    const openBtn = page.locator('div.fixed.bottom-6.right-6 button').first();
    await openBtn.click();
    await expect(page.locator('text=AI Support Assistant')).toBeVisible();
  });

  test('send message with mocked API', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            message: 'hello',
            reply: 'ok',
          },
        }),
      });
    });

    await page.goto('/dashboard/owner');
    await page.locator('div.fixed.bottom-6.right-6 button').first().click();
    await page.getByPlaceholder('Nhập câu hỏi...').fill('hello');
    await page.locator('button[aria-label="Gửi"]').click();
    await expect(page.locator('text=hello')).toBeVisible();
  });

  test('owner and admin settings pages load', async ({ page, loginAsAdmin }) => {
    await page.goto('/dashboard/owner/settings');
    await expect(page).toHaveURL(/\/dashboard\/owner\/settings/);
    await expect(page.locator('h1').first()).toBeVisible();

    await loginAsAdmin();
    await page.goto('/dashboard/admin/settings');
    await expect(page).toHaveURL(/\/dashboard\/admin\/settings/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
