import { test, expect } from '@playwright/test';
import { normalizeBase } from '../../src/config/hosting';
const base = normalizeBase(process.env.SITE_BASE);

test('search shows own-page summaries without description metadata or card dates', async ({ page }) => {
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/search/`);
    const input = page.locator('.pagefind-ui__search-input');
    await input.fill(locale === 'en' ? 'layout' : '版型');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    await expect(page.locator('.pagefind-ui__results')).not.toContainText('Description:');
    await expect(page.locator(`.pagefind-ui__result-link[href="${base}${locale}/topics/web-foundations/"]`)).toHaveCount(0);
    for (const [term, route] of [
      [locale === 'en' ? 'Website Engineering' : '網站建置', 'topics/web-foundations'],
      [locale === 'en' ? 'Building a technical blog with Astro' : '用 Astro 建立技術部落格', 'learn/knowledge-platform'],
    ]) {
      await input.fill(term!);
      const result = page.locator('.pagefind-ui__result').filter({ has: page.locator(`.pagefind-ui__result-link[href="${base}${locale}/${route}/"]`) });
      await expect(result).toBeVisible();
      await expect(result).not.toContainText(/2026-09-|Description:|更新日期/);
    }
  }
});

test('404 provides usable bilingual recovery links without JavaScript at unknown nested URLs', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  const page = await context.newPage();
  try {
    for (const locale of ['en', 'zh-tw']) {
      const response = await page.goto(`${locale}/missing/nested-page/`);
      expect(response?.status()).toBe(404);
      await expect(page.locator('h1')).toContainText('404');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
      for (const language of ['en', 'zh-tw']) for (const section of ['search', 'start', 'blog']) {
        await expect(page.locator(`main a[href="${base}${language}/${section}/"]`)).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator(`main a[href="${base}${locale}/start/"]`).click();
      await expect(page).toHaveURL(new RegExp(`${base}${locale}/start/$`));
      await expect(page.locator('h1')).toBeVisible();
    }
  } finally { await context.close(); }
});

test('copy control stays inside code frame without covering code at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/blog/astro-project-setup/`);
    const block = page.locator('.code-block').first();
    const button = block.getByRole('button');
    await expect(button).toBeVisible();
    const control = await button.boundingBox();
    const frame = await block.locator('pre').boundingBox();
    const codeTop = await block.locator('code').evaluate(el => el.getBoundingClientRect().top);
    expect(control && frame && control.x >= frame.x && control.y >= frame.y && control.x + control.width <= frame.x + frame.width).toBeTruthy();
    expect(control!.y + control!.height).toBeLessThanOrEqual(codeTop);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await block.screenshot({ path: `test-results/code-frame-${locale}.png` });
  }
});
