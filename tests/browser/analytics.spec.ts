import { test, expect } from '@playwright/test';
import { measurementId } from '../../src/lib/analytics/config';
import { normalizeBase } from '../../src/config/hosting';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const id = measurementId(true, process.env.PUBLIC_GA_MEASUREMENT_ID);
const base = normalizeBase(process.env.SITE_BASE);
// Refuse both real-ID environment values and mismatched previously built artifacts
// before opening a browser page. Clearing an env var alone cannot sanitize dist.
if (process.env.PUBLIC_GA_MEASUREMENT_ID && id !== 'G-123456ABCD') throw new Error('Browser tests accept only the synthetic analytics ID.');
for (const file of readdirSync('dist', { recursive: true, encoding: 'utf8' }).filter(file => file.endsWith('.html'))) {
  const artifactId = /name="platform-analytics" content="([^"]+)"/.exec(readFileSync(join('dist', file), 'utf8'))?.[1];
  if (artifactId !== id) throw new Error('Rebuild browser fixtures with the synthetic ID (or unset for disabled tests).');
}

test('local preview never loads Google, including artifacts configured for production', async ({ page }) => {
  const google: string[] = [];
  await page.route(/https:\/\/.*google/, route => { google.push(route.request().url()); return route.abort(); });
  await page.goto('en/');
  await page.locator('#theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => window.platformAnalyticsEnabled)).toBeUndefined();
  expect(google).toEqual([]);
});

test('production-origin artifact loads one tag per MPA document and works when blocked', async ({ page, baseURL }) => {
  test.skip(!id || !process.env.SITE_URL?.startsWith('https:'), 'Requires an explicitly configured production fixture build');
  const origin = new URL(process.env.SITE_URL!).origin;
  const google: string[] = [];
  await page.route(`${origin}/**`, async route => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: new URL(url.pathname + url.search, baseURL).href });
    await route.fulfill({ response });
  });
  await page.route('https://www.googletagmanager.com/**', route => { google.push(route.request().url()); return route.abort(); });
  const campaign = 'utm_source=newsletter&utm_medium=email&utm_campaign=fall-2026&utm_term=astro&utm_content=hero&gclid=fixture-123';
  const referrer = 'https://referrer.example/';
  await page.goto(`${origin}${base}en/?${campaign}&query=private&q=private&email=private&token=private#fragment`, { referer: referrer });
  await expect.poll(() => google.length).toBe(1);
  const commands = await page.evaluate(() => (window.dataLayer ?? []).map(entry => Array.from(entry as IArguments)));
  expect(commands.filter(entry => entry[0] === 'config')).toHaveLength(1);
  expect(commands[1]?.[2]).toEqual({ page_location: `${origin}${base}en/?${campaign}`, allow_google_signals: false, allow_ad_personalization_signals: false });
  expect(await page.evaluate(() => document.referrer)).toBe(referrer);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}${base}en/`);
  await page.locator('#theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.site-nav').getByRole('link', { name: 'Search', exact: true }).click();
  await page.locator('.pagefind-ui__search-input').fill('AI SRE Platform');
  await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
  await expect.poll(() => google.length).toBe(2);
});
