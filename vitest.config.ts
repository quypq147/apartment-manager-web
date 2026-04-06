import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom', // Giả lập trình duyệt để test React Component
    setupFiles: ['./vitest.setup.ts'], // File chạy trước khi test
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e/**/*'], // Bỏ qua thư mục e2e của Playwright
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'], // Xuất report ra console và file HTML
      exclude: [
        'node_modules',
        '.next',
        'tests/e2e', // Không đo coverage các file test E2E
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
})