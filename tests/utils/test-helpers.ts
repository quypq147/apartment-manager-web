import { Page, APIRequestContext } from '@playwright/test';

/**
 * Utility functions cho testing
 */

/**
 * Mock Gemini AI responses để tiết kiệm API quota
 */
export async function mockAIChatResponse(page: Page, mockResponse: string) {
  await page.route('**/api/chat', async (route) => {
    await route.abort();
  });

  // Hoặc sử dụng Service Worker để intercept
  await page.addInitScript(() => {
    // Store mock response globally
    (window as any).__mockAIResponse = mockResponse;
  });
}

/**
 * Chờ cho API request hoàn thành
 */
export async function waitForAPIResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(
    (response) => {
      if (typeof urlPattern === 'string') {
        return response.url().includes(urlPattern);
      }
      return urlPattern.test(response.url());
    },
    { timeout: 10000 }
  );
}

/**
 * Kiểm tra notification/toast message
 */
export async function waitForNotification(
  page: Page,
  message: string,
  options: { type?: 'success' | 'error' | 'info'; timeout?: number } = {}
) {
  const timeout = options.timeout || 5000;
  const notificationSelector = `*:has-text("${message}")`;

  try {
    await page.locator(notificationSelector).waitFor({ timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fill form input với delay giữa các keypress (tránh spam)
 */
export async function fillInputSafely(page: Page, selector: string, text: string, delayMs: number = 50) {
  const input = page.locator(selector);
  await input.focus();

  for (const char of text) {
    await input.type(char);
    await page.waitForTimeout(delayMs);
  }
}

/**
 * Kiểm tra rằng URL chứa path nào đó
 */
export async function expectUrlContains(page: Page, pathPart: string) {
  const url = page.url();
  if (!url.includes(pathPart)) {
    throw new Error(`Expected URL to contain "${pathPart}", but got "${url}"`);
  }
}

/**
 * Lấy số tiền suất hiện trên UI (ví dụ "1.250.000 ₫" -> 1250000)
 */
export function parseCurrencyText(text: string): number {
  // Loại bỏ ký hiệu tiền tệ, khoảng trắng, dấu chấm phân cách
  const cleaned = text
    .replace(/[₫$]/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '');
  return parseInt(cleaned, 10);
}

/**
 * Format tiền theo định dạng Việt
 */
export function formatVietnamCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
}

/**
 * Kiểm tra element có hiển thị không (với retry logic)
 */
export async function isElementVisible(page: Page, selector: string, timeout: number = 3000): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Click element sau khi nó ready (với retry)
 */
export async function safeClick(
  page: Page,
  selector: string,
  options: { retries?: number; delay?: number } = {}
) {
  const { retries = 3, delay = 500 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      await page.click(selector, { timeout: 5000 });
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(delay);
    }
  }
  return false;
}

/**
 * Lấy table data thành array objects
 */
export async function getTableData(page: Page): Promise<Record<string, string>[]> {
  const tables = await page.$$('table');
  if (tables.length === 0) return [];

  const table = tables[0];
  const headers = await table.$$eval('thead th', (ths) => ths.map((th) => th.textContent?.trim() || ''));

  const rows = await table.$$eval('tbody tr', (trs, headers) => {
    return trs.map((tr) => {
      const cells = tr.querySelectorAll('td');
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = cells[idx]?.textContent?.trim() || '';
      });
      return row;
    });
  }, headers);

  return rows;
}
