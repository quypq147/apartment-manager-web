import { expect, type Page } from '@playwright/test';

export function escapeForRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function assertPageLoaded(page: Page, path: string, heading?: RegExp) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp(`${escapeForRegExp(path)}$`), { timeout: 20000 });

  if (heading) {
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
    return;
  }

  await expect(page.locator('h1').first()).toBeVisible();
}

export async function getAuthHeaders(page: Page) {
  const cookies = await page.context().cookies();
  const userId = cookies.find((cookie) => cookie.name === 'user_id')?.value ?? '';
  const userRole = cookies.find((cookie) => cookie.name === 'user_role')?.value ?? '';
  const cookieHeader = cookies
    .filter((cookie) => cookie.name === 'user_id' || cookie.name === 'user_role')
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  return {
    Cookie: cookieHeader,
    'x-user-id': userId,
    'x-user-role': userRole,
  };
}

export async function getFirstIdFromList(page: Page, endpoint: string) {
  const response = await page.request.get(endpoint);
  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  const firstId = payload?.data?.[0]?.id;

  expect(typeof firstId).toBe('string');
  return firstId as string;
}