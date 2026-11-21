// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const LANGS = ['pt', 'en', 'de', 'fr'];
const SIZES = [
  { width: 375, height: 812, label: '375' },
  { width: 1440, height: 900, label: '1440' },
];

// Pre-accept consent and stub fbq so airaPixelLead() works
async function setupFbqMock(page) {
  await page.addInitScript(() => {
    window._fbqLeads = 0;
    localStorage.setItem('aira-pixel-consent', 'accepted');
    window.fbq = function(cmd, evt) {
      if (cmd === 'track' && evt === 'Lead') window._fbqLeads++;
    };
    window.fbq.loaded = true;
    window._fbq = window.fbq;
  });
  await page.route('**connect.facebook.net**', r => r.abort());
}

function screensDir() {
  const d = path.join(__dirname, '..', '_screens', 'windows');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

// ── Responsive checks for /windows and /home/ ─────────────────────────────

for (const size of SIZES) {
  for (const lang of LANGS) {
    test(`windows ${size.label} ${lang}: no errors, no hscroll, images ok`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));
      await page.route('**connect.facebook.net**', r => r.abort());

      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/windows.html');
      await page.click(`button.lang-btn[onclick="setLang('${lang}')"]`);
      await page.waitForTimeout(200);

      const hScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 1);
      expect(hScroll, `hscroll at ${size.width}px`).toBe(false);

      const badImgs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter(i => i.complete && i.naturalWidth === 0 && i.src)
          .map(i => i.src));
      expect(badImgs, 'broken images').toHaveLength(0);

      expect(errors, 'console errors').toHaveLength(0);
    });

    test(`home ${size.label} ${lang}: no errors, no hscroll, images ok`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));
      await page.route('**connect.facebook.net**', r => r.abort());

      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/home/');
      const langBtn = page.locator(`button.lang-btn[onclick="setLang('${lang}')"]`).first();
      await langBtn.click();
      await page.waitForTimeout(200);

      const hScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 1);
      expect(hScroll, `hscroll at ${size.width}px`).toBe(false);

      const badImgs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter(i => i.complete && i.naturalWidth === 0 && i.src)
          .map(i => i.src));
      expect(badImgs, 'broken images').toHaveLength(0);

      expect(errors, 'console errors').toHaveLength(0);
    });
  }
}

// ── /windows links in nav/footer of hub pages ─────────────────────────────

for (const href of ['/airahome.html', '/construction.html', '/energia.html', '/garden.html', '/home/']) {
  test(`${href} has /windows link (200)`, async ({ page }) => {
    // route /windows → windows.html content so the link resolves to 200
    await page.route('**/windows', async r => {
      const resp = await page.request.fetch('/windows.html');
      r.fulfill({ status: 200, body: await resp.body(), contentType: 'text/html' });
    });
    await page.goto(href);
    const count = await page.locator('a[href="/windows"]').count();
    expect(count, `${href} should have link to /windows`).toBeGreaterThan(0);
  });
}

// ── Form tests via page.route ──────────────────────────────────────────────

test('windows form: 200 → 1 Lead, confirmation shown', async ({ page }) => {
  await setupFbqMock(page);
  await page.route('**/webhook/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

  await page.goto('/windows.html');
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="phone"]', '+351900000000');
  await page.fill('[name="location"]', 'Portimão');
  await page.check('#consent');
  await page.click('button[type="submit"]');

  await page.waitForSelector('#formStatus.ok', { timeout: 6000 });
  expect(await page.evaluate(() => window._fbqLeads)).toBe(1);
});

test('windows form: 500 → 0 Leads, confirmation shown', async ({ page }) => {
  await setupFbqMock(page);
  await page.route('**/webhook/**', r =>
    r.fulfill({ status: 500, body: 'error' }));

  await page.goto('/windows.html');
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="phone"]', '+351900000000');
  await page.fill('[name="location"]', 'Portimão');
  await page.check('#consent');
  await page.click('button[type="submit"]');

  await page.waitForSelector('#formStatus.ok', { timeout: 6000 });
  expect(await page.evaluate(() => window._fbqLeads)).toBe(0);
});

// ── Screenshots ───────────────────────────────────────────────────────────

for (const [route, label] of [['/windows.html', 'windows'], ['/home/', 'home']]) {
  for (const size of [{ width: 375, height: 812, label: '375' }, { width: 1440, height: 900, label: '1440' }]) {
    for (const lang of ['pt', 'en']) {
      test(`screenshot ${label} ${size.label} ${lang}`, async ({ page }) => {
        await page.route('**connect.facebook.net**', r => r.abort());
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(route);
        if (label === 'windows') {
          await page.click(`button.lang-btn[onclick="setLang('${lang}')"]`);
        } else {
          await page.locator(`button.lang-btn[onclick="setLang('${lang}')"]`).first().click();
        }
        await page.waitForTimeout(300);
        const dir = screensDir();
        const file = path.join(dir, `${label}-${size.label}-${lang}.png`);
        await page.screenshot({ path: file, fullPage: true });
        expect(fs.existsSync(file)).toBe(true);
      });
    }
  }
}
