// @ts-check
const { test, expect } = require('@playwright/test');

// Inject a fbq stub before any page script runs so consent-pixel.js uses it
async function setupFbqMock(page) {
  await page.addInitScript(() => {
    window._fbqLeads = 0;
    // Pre-define fbq so loadPixel() sets airaPixelLead but skips real Meta snippet
    window.fbq = function(cmd, evt) {
      if (cmd === 'track' && evt === 'Lead') window._fbqLeads++;
    };
    window.fbq.loaded = true;
    window._fbq = window.fbq;
  });
  await page.route('**connect.facebook.net**', r => r.abort());
}

async function acceptConsent(page) {
  await page.click('#aira-cb-ok');
  await page.waitForTimeout(50); // let loadPixel() run
}

const leads = page => page.evaluate(() => window._fbqLeads);

// ─── energia: proper success/error branches ───────────────────────────────

test('energia: success → 1 Lead', async ({ page }) => {
  await setupFbqMock(page);
  await page.route('**/webhook/aira-energia-leads', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

  await page.goto('/energia.html');
  await acceptConsent(page);

  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="phone"]', '+351900000000');
  await page.fill('[name="freguesia"]', 'Portimão');
  await page.fill('[name="bill"]', '90');

  await page.click('button[type="submit"]');
  await page.waitForSelector('#formStatus.ok');

  expect(await leads(page)).toBe(1);
});

test('energia: error → 0 Leads', async ({ page }) => {
  await setupFbqMock(page);
  await page.route('**/webhook/aira-energia-leads', r =>
    r.fulfill({ status: 500, body: 'error' }));

  await page.goto('/energia.html');
  await acceptConsent(page);

  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="phone"]', '+351900000000');
  await page.fill('[name="freguesia"]', 'Portimão');
  await page.fill('[name="bill"]', '90');

  await page.click('button[type="submit"]');
  await page.waitForSelector('#formStatus.err');

  expect(await leads(page)).toBe(0);
});

// ─── concierge: separate webhook, .status.ok class ───────────────────────

test('concierge: success → 1 Lead', async ({ page }) => {
  await setupFbqMock(page);
  await page.route('**/webhook/aira-site-leads', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

  await page.goto('/concierge.html');
  await acceptConsent(page);

  await page.fill('#f-name', 'Test User');
  await page.fill('#f-hotel', 'Test Hotel');
  await page.fill('#f-email', 'test@example.com');

  await page.click('button[type="submit"]');
  await page.waitForSelector('#formStatus.ok');

  expect(await leads(page)).toBe(1);
});

test('concierge: error → 0 Leads', async ({ page }) => {
  await setupFbqMock(page);
  await page.route('**/webhook/aira-site-leads', r =>
    r.fulfill({ status: 500, body: 'error' }));

  await page.goto('/concierge.html');
  await acceptConsent(page);

  await page.fill('#f-name', 'Test User');
  await page.fill('#f-hotel', 'Test Hotel');
  await page.fill('#f-email', 'test@example.com');

  await page.click('button[type="submit"]');
  await page.waitForSelector('#formStatus.err');

  expect(await leads(page)).toBe(0);
});

// ─── construction: best-effort (done() fires on both then+catch) ──────────

test('construction: best-effort — Lead fires even on webhook 500', async ({ page }) => {
  await setupFbqMock(page);
  // 500 to prove best-effort: done() runs in .catch(done) too
  await page.route('**/webhook/aira-airahome-leads', r =>
    r.fulfill({ status: 500, body: 'error' }));

  await page.goto('/construction.html');
  await acceptConsent(page);

  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="phone"]', '+351900000000');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="location"]', 'Portimão');
  await page.check('#consent');

  await page.click('button[type="submit"]');
  await page.waitForSelector('#formStatus.ok');

  expect(await leads(page)).toBe(1);
});
