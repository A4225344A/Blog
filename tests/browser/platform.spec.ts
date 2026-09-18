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
    await expect(page.locator('main')).toContainText(/lab/i);
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
    await expect(articleResult).toBeVisible();
    for (const href of await page.locator('.pagefind-ui__result-link').evaluateAll(links => links.map(link => link.getAttribute('href'))))
      expect(href).toMatch(new RegExp(`${base}${locale}/(?:blog|cases|topics|learn|projects)/[^/]+/$`));
  }
});

test('detail pages localize metadata and omit empty optional relationships', async ({ page }) => {
  for (const [locale, difficulty, recommended, projects, related, paths] of [
    ['en', 'Intermediate', 'Recommended reading', 'Projects', 'Related articles', 'Related learning paths'],
    ['zh-tw', '中階', '延伸閱讀', '專案', '相關文章', '相關學習路徑'],
  ] as const) {
    await page.goto(`${locale}/blog/astro-knowledge-platform/`);
    await expect(page.locator('main')).toContainText(difficulty);
    await expect(page.getByRole('heading', { name: recommended, exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: projects, exact: true })).toHaveCount(0);
    await page.goto(`${locale}/projects/ai-sre-platform/`);
    await expect(page.getByRole('heading', { name: related, exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: paths, exact: true })).toHaveCount(0);
    await expect(page.locator('main')).toContainText(locale === 'en' ? 'Maturity: Lab' : '成熟度: 實驗室（lab）');
    await page.goto(`${locale}/learn/knowledge-platform/`);
    await expect(page.locator('main')).toContainText(locale === 'en' ? 'For: Engineers · Technical writers' : '適合對象: 工程師 · 技術寫作者');
  }
});
