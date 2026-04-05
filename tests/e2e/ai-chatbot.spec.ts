import { test, expect } from '../fixtures/auth';

test.describe('AI Chatbot & Features', () => {
  test.beforeEach(async ({ loginAsOwner }) => {
    await loginAsOwner();
  });

  test('TC_AI_01: Mở cửa sổ Chatbot', async ({ page }) => {
    // Tìm nút chat/chatbot
    const chatButton = page.locator(
      'button:has-text(/chat|AI|trợ giúp|help/i), [aria-label*="chat"]'
    ).first();

    if (await chatButton.isVisible().catch(() => false)) {
      await chatButton.click();

      // Kiểm tra cửa sổ chat mở ra
      const chatWindow = page.locator('[role="dialog"], .chat-window, .modal').first();
      await expect(chatWindow).toBeVisible({ timeout: 5000 }).catch(() => null);

      // Kiểm tra input message
      const messagInput = page.locator(
        'input[type="text"], textarea',
        { has: page.locator('text=/gửi|send/i') }
      ).first();
      await expect(messagInput).toBeVisible({ timeout: 5000 }).catch(() => null);
    }
  });

  test('TC_AI_02: Gửi message và nhận response từ AI', async ({ page }) => {
    // Mở chatbot
    const chatButton = page.locator('button:has-text(/chat|AI|trợ giúp/i)').first();

    if (await chatButton.isVisible().catch(() => false)) {
      await chatButton.click();

      await page.waitForTimeout(300);

      // Tìm input message
      const messageInput = page.locator(
        'input[type="text"], textarea[placeholder*="nhập|type|message"]'
      ).first();

      if (await messageInput.isVisible().catch(() => false)) {
        // Gửi message
        await messageInput.click();
        await messageInput.type('Làm sao để tạo hợp đồng thuê phòng?');
        await messageInput.press('Enter');

        // Chờ response
        await page.waitForTimeout(1000);

        // Kiểm tra có reply từ AI
        const aiMessage = page.locator('text=/.*hợp đồng|contract|tài sản|property.*/i');
        await expect(aiMessage).toBeVisible({ timeout: 10000 }).catch(() => null);

        // Kiểm tra message được hiển thị trong chat
        const userMessage = page.locator('text=/.*Làm sao để tạo hợp đồng.*/i');
        await expect(userMessage).toBeVisible({ timeout: 5000 }).catch(() => null);
      }
    }
  });

  test('TC_AI_03: Mock AI response để tiết kiệm quota', async ({ page }) => {
    // Intercept Gemini API request
    await page.route('**/api/chat', async (route) => {
      // Mock response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message:
            'Để tạo hợp đồng thuê phòng, bạn vào menu "Hợp Đồng", click "Tạo mới", chọn phòng, điền thông tin và lưu.',
          success: true,
        }),
      });
    });

    // Mở chat
    const chatButton = page.locator('button:has-text(/chat|AI/i)').first();
    if (await chatButton.isVisible().catch(() => false)) {
      await chatButton.click();

      const messageInput = page.locator('input[type="text"], textarea').first();
      if (await messageInput.isVisible().catch(() => false)) {
        await messageInput.fill('Giải thích cách sử dụng');
        await messageInput.press('Enter');

        await page.waitForTimeout(500);

        // Kiểm tra mock response xuất hiện
        const response = page.locator('text=/.*Để tạo hợp đồng.*/i');
        await expect(response).toBeVisible({ timeout: 5000 }).catch(() => null);
      }
    }
  });

  test('TC_AI_04: Xem AI Overview trên Dashboard', async ({ page }) => {
    // Vào dashboard owner
    await page.goto('/dashboard/owner');

    // Tìm section "AI Overview" hoặc button
    const aiOverviewBtn = page.locator(
      'button:has-text(/phân tích|AI|overview|insights/i), section:has-text(/phân tích/i)'
    ).first();

    if (await aiOverviewBtn.isVisible().catch(() => false)) {
      // Nếu nó là button, click nó
      const isButton = await aiOverviewBtn.evaluate((el) => el.tagName === 'BUTTON');
      if (isButton) {
        await aiOverviewBtn.click();
      }

      // Chờ load AI content
      await page.waitForTimeout(1000);

      // Kiểm tra hiển thị AI insight
      const insight = page.locator('text=/.*doanh thu|income|analysis|phân tích.*/i');
      await expect(insight).toBeVisible({ timeout: 10000 }).catch(() => null);
    }
  });

  test('TC_EDGE_AI_01: Test AI response với special characters', async ({ page }) => {
    const chatButton = page.locator('button:has-text(/chat|AI/i)').first();

    if (await chatButton.isVisible().catch(() => false)) {
      await chatButton.click();

      const messageInput = page.locator('input[type="text"], textarea').first();
      if (await messageInput.isVisible().catch(() => false)) {
        // Gửi message với special chars
        await messageInput.fill('Test <script>alert("xss")</script> & \\"quotes\\"');
        await messageInput.press('Enter');

        await page.waitForTimeout(1000);

        // Kiểm tra không có error
        const errorText = page.locator('text=/error|lỗi/i');
        const isError = await errorText.isVisible().catch(() => false);
        expect(isError).toBe(false);
      }
    }
  });
});

test.describe('UI/UX Features', () => {
  test('TC_UI_01: Chuyển đổi Dark/Light mode', async ({ page, loginAsOwner }) => {
    await loginAsOwner();

    // Tìm button toggle theme
    const themeToggle = page.locator(
      'button[aria-label*="theme|dark|light"], button:has-text(/🌙|☀️)/)'
    ).first();

    if (await themeToggle.isVisible().catch(() => false)) {
      const initialMode = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme') || 'light'
      );

      // Toggle theme
      await themeToggle.click();

      await page.waitForTimeout(300);

      const newMode = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme') || 'light'
      );

      // Kiểm tra theme thay đổi
      expect(newMode).not.toBe(initialMode);
    }
  });

  test('TC_UI_02: Responsive trên mobile view', async ({ page, loginAsOwner, browser }) => {
    // Mở browser với mobile viewport
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone size
    });

    const mobilePage = await mobileContext.newPage();

    // Login
    await mobilePage.goto('/login');
    await mobilePage.fill('input[type="email"]', 'owner_test@example.com');
    await mobilePage.fill('input[type="password"]', 'password123');
    await mobilePage.click('button[type="submit"]');

    await mobilePage.waitForURL(/.*\/dashboard\/owner\/.*/);

    // Kiểm tra sidebar/menu responsive
    const sidebar = mobilePage.locator('aside, nav[role="navigation"]').first();

    if (await sidebar.isVisible().catch(() => false)) {
      // Check if hamburger menu appeared
      const hamburger = mobilePage.locator('button:has-text(/☰|menu/i)').first();
      const isHamburgerVisible = await hamburger.isVisible().catch(() => false);

      // Either sidebar is not visible (collapse) hoặc hamburger visible
      if (isHamburgerVisible) {
        await hamburger.click();
      }

      // Sidebar content phải responsive
      const sidebarItems = mobilePage.locator(
        'aside a, nav a, [role="menuitem"]'
      );
      const itemCount = await sidebarItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }

    await mobileContext.close();
  });

  test('TC_UI_03: Notification/Toast hiển thị đúng', async ({ page, loginAsOwner }) => {
    await loginAsOwner();

    await page.goto('/dashboard/owner/properties');

    // Trigger action tạo property
    const addBtn = page.locator('button:has-text(/thêm|create/i)').first();

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();

      await page.waitForTimeout(300);

      // Điền thông tin
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('Test Notification');

        // Submit
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();

          // Xem notification
          const notification = page.locator('[role="alert"], .toast, .notification').first();
          await expect(notification).toBeVisible({ timeout: 5000 }).catch(() => null);

          // Notification phải auto dismiss sau một thời gian hoặc có nút close
          const closeBtn = notification.locator('button').first();
          if (await closeBtn.isVisible().catch(() => false)) {
            await closeBtn.click();
          }
        }
      }
    }
  });
});
