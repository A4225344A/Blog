import { test, expect } from '@playwright/test';
import { normalizeBase } from '../../src/config/hosting';

const base = normalizeBase(process.env.SITE_BASE);

test('published case is discoverable with a date, canonical route and external prerequisites', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of ['en', 'zh-tw']) {
    const path = `${base}${locale}/cases/ai-sre-rollout-verification/`;
    await page.goto(`${locale}/`);
    await expect(page.locator('.latest-articles .article-title').first()).toHaveAttribute('href', path);
    await page.locator('.latest-articles .article-title').first().click();
    await expect(page).toHaveURL(new RegExp(`${locale}/cases/ai-sre-rollout-verification/$`));
    await expect(page.locator('time').first()).toHaveAttribute('datetime', '2026-09-28T00:00:00.000Z');
    await expect(page.locator('.prose a[href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"]').first()).toBeVisible();
    await expect(page.locator('.prose')).toContainText('def rollout_complete');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const feed = await page.request.get(`${locale}/rss.xml`);
    const firstItem = (await feed.text()).match(/<item>([\s\S]*?)<\/item>/)?.[1] ?? '';
    expect(firstItem).toContain(path);
    expect(firstItem).toContain('<pubDate>Mon, 28 Sep 2026 00:00:00 GMT</pubDate>');
    const sitemap = await page.request.get(`${base}sitemap.xml`);
    expect(await sitemap.text()).toContain(path);
    await page.goto(`${locale}/search/`);
    await page.locator('.pagefind-ui__search-input').fill('CrashLoopBackOff');
    const result = page.locator(`.pagefind-ui__result-link[href="${path}"]`);
    await expect(result).toBeVisible();
    await result.click();
    await expect(page).toHaveURL(new RegExp(`${locale}/cases/ai-sre-rollout-verification/$`));
  }
});
