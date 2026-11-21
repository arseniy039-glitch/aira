// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  use: { baseURL: 'http://localhost:7722' },
  webServer: {
    command: 'python3 -m http.server 7722',
    port: 7722,
    reuseExistingServer: true,
  },
});
