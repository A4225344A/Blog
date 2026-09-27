import { test, expect } from '@playwright/test';
import { normalizeBase } from '../../src/config/hosting';
const base = normalizeBase(process.env.SITE_BASE);

test('projects lead back into the blog and Astro articles belong to the blog project', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/projects/ai-sre-platform/`);
    await expect(page.locator('#project-overview')).toBeVisible();
    await expect(page.locator('main')).toContainText('platform-gitops/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/project-overview-${locale}.png`, fullPage: true });
    const navigation = page.locator('.project-navigation');
    await expect(navigation.locator(`a[href="${base}${locale}/learn/"]`)).toHaveText(locale === 'en' ? 'Article series' : '文章系列');
    await navigation.locator(`a[href="${base}${locale}/projects/"]`).click();
    await page.locator(`main a[href="${base}${locale}/projects/technical-blog/"]`).click();
    await expect(page.locator('main .article-title')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(`main a[href="${base}${locale}/learn/knowledge-platform/"]`)).toBeVisible();
    await page.locator(`main .article-title[href="${base}${locale}/blog/astro-content-and-layout/"]`).click();
    await expect(page.locator(`main a[href="${base}${locale}/projects/technical-blog/"]`)).toBeVisible();
    await expect(page.locator('.learning-diagram li')).toHaveCount(3);
    await expect(page.locator('.learning-diagram')).toContainText('<slot />');
  }
});

test('compact code and layout diagrams fit mobile and retain dark contrast without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 360, height: 800 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    for (const locale of ['en', 'zh-tw']) {
      await page.goto(`${locale}/blog/astro-content-and-layout/`);
      await expect(page.locator('.learning-diagram')).toBeVisible();
      expect(await page.locator('.prose pre').first().evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(13, 16, 26)');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.learning-diagram').screenshot({ path: `test-results/layout-flow-${locale}.png` });
    }
  } finally { await context.close(); }
});
