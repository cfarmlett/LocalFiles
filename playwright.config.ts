import { defineConfig, devices } from "playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:5173",
  },
  webServer: {
    command: "pnpm --filter @localdocs/web dev -- --host 127.0.0.1",
    reuseExistingServer: true,
    url: "http://127.0.0.1:5173",
  },
});
