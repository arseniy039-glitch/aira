// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SVC_PHOTOS = {
  '1': 'construction-svc-1-demolition',
  '2': 'construction-svc-2-plaster',
  '3': 'construction-svc-3-floor',
  '4': 'construction-svc-4-bathroom',
  '5': 'construction-svc-5-door',
  '6': 'construction-svc-6-kitchen',
  '7': 'construction-svc-7-electric',
  '8': 'construction-svc-8-cleanup',
};

const SIZES = [
  { width: 375, height: 812, label: '375' },
  { width: 1440, height: 900, label: '1440' },
];

function screensDir() {
  const d = path.join(__dirname, '..', '_screens', 'construction');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

for (const size of SIZES) {
  for (const [svcId, photoSlug] of Object.entries(SVC_PHOTOS)) {
    test(`construction svc-${svcId} photo at ${size.label}px`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));
      await page.route('**connect.facebook.net**', r => r.abort());
      await page.route('**/webhook/**', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/construction.html');

      // Click tile
      await page.click(`[data-open-svc="${svcId}"]`);
      await page.waitForSelector('#svc-modal.open', { timeout: 3000 });

      // Check modal image has correct photo
      const imgSrc = await page.locator('#svc-modal-img img').getAttribute('src');
      expect(imgSrc, `svc-${svcId} modal img src`).toContain(photoSlug);

      // Check image loaded (naturalWidth > 0)
      const loaded = await page.locator('#svc-modal-img img').evaluate(
        img => img.complete && img.naturalWidth > 0
      );
      expect(loaded, `svc-${svcId} image loaded`).toBe(true);

      expect(errors, `svc-${svcId} console errors`).toHaveLength(0);

      // Screenshot
      const dir = screensDir();
      const file = path.join(dir, `svc-${svcId}-${size.label}.png`);
      await page.screenshot({ path: file });
    });
  }
}
