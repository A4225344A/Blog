import { test, expect } from '@playwright/test';
import { normalizeBase } from '../../src/config/hosting';
const base = normalizeBase(process.env.SITE_BASE);
test('theme follows OS, persists explicit choices, and restores system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('en/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#theme')).toHaveValue('system');
  await page.locator('#theme').selectOption('light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#theme')).toHaveValue('light');
  await page.locator('#theme').selectOption('system');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
test('theme works with denied storage and mobile navigation remains accessible', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } }); });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('en/');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to content', { exact: true })).toBeFocused();
  await page.locator('#theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.site-nav').getByRole('link', { name: 'Topics', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}en/topics/$`));
  await page.getByRole('link', { name: '繁體中文', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}zh-tw/topics/$`));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('local search returns working canonical URLs in both locales', async ({ page }) => {
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/search/`);
    const input = page.locator('.pagefind-ui__search-input');
    await expect(input).toBeVisible();
    await input.fill('AI SRE Platform');
    const result = page.locator('.pagefind-ui__result-link').filter({ hasText: 'AI SRE Platform' }).first();
    await expect(result).toBeVisible();
    await expect(result).toHaveAttribute('href', `${base}${locale}/projects/ai-sre-platform/`);
    await result.click();
    await expect(page.locator('main')).toContainText('lab');
  }
});
test('Article translation preserves context and search indexes Skill text', async ({ page }) => {
  await page.goto('en/blog/astro-knowledge-platform/');
  await expect(page.locator('h1')).toContainText('Building a Zero-Cost');
  await page.getByRole('link', { name: '繁體中文', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}zh-tw/blog/astro-knowledge-platform/$`));
  await expect(page.locator('h1')).toContainText('使用 Astro');
  await expect(page.locator('.toc a').first()).toBeVisible();
  for (const [locale, query] of [['en', 'Astro content modeling'], ['zh-tw', '內容建模']]) {
    await page.goto(`${locale}/search/`);
    await page.locator('.pagefind-ui__search-input').fill(query ?? '');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const articleResult = page.locator(`.pagefind-ui__result-link[href="${base}${locale}/blog/astro-knowledge-platform/"]`).first();
    // Broad Chinese terms also match aggregators; verify across real result pages.
    for (let pageNumber = 0; pageNumber < 10 && !await articleResult.isVisible(); pageNumber++) {
      const more = page.locator('.pagefind-ui__button');
      if (!await more.isVisible()) break;
      const previousCount = await page.locator('.pagefind-ui__result-link').count();
      await more.click();
      await expect.poll(() => page.locator('.pagefind-ui__result-link').count()).toBeGreaterThan(previousCount);
    }
    await expect(articleResult).toBeVisible();
  }
});
