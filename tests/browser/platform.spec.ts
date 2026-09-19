import { test, expect } from '@playwright/test';
import { normalizeBase } from '../../src/config/hosting';
const base = normalizeBase(process.env.SITE_BASE);

test('lesson diagrams remain readable on mobile and desktop without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const locale of ['zh-tw', 'en']) {
    for (const lesson of ['beginner-tools', 'beginner-local-website', 'beginner-first-change']) {
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: width === 375 ? 'dark' : 'light' });
        await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/${lesson}/`);
        const figure = page.locator('figure.learning-diagram');
        await expect(figure).toBeVisible();
        await expect(figure.locator('figcaption')).not.toBeEmpty();
        await expect(figure.locator('li')).toHaveCount(lesson === 'beginner-local-website' ? 3 : 4);
        expect(await figure.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        if (locale === 'zh-tw' && lesson === 'beginner-first-change') {
          await figure.screenshot({ path: `test-results/lesson-diagram-${width}.png` });
        }
      }
    }
  }
  await context.close();
});

test('a beginner can follow all three lessons and switch languages without losing their place', async ({ page }) => {
  for (const [locale, beginner, experienced, firstTitle, next, previous, switchLanguage] of [
    ['zh-tw', '我沒有開發經驗', '我已經會寫程式', '第一次做網站：認識工具，找到輸入指令的地方', '下一篇', '上一篇', 'English'],
    ['en', 'I have no coding experience', 'I already write code', 'Your first website — understand the tools and where to type commands', 'Next lesson', 'Previous lesson', '繁體中文'],
  ] as const) {
    await page.goto(`${locale}/start/`);
    const entry = page.getByRole('region', { name: beginner });
    await expect(page.getByRole('region', { name: experienced })).toBeVisible();
    await entry.getByRole('link').click();
    await expect(page).toHaveURL(`${new URL(page.url()).origin}${base}${locale}/learn/first-website/`);
    await expect(page.locator('main ol.cards li')).toHaveCount(3);
    await page.getByRole('link', { name: firstTitle, exact: true }).click();
    await expect(page.locator('h1')).toHaveText(firstTitle);
    const pathNav = page.locator('nav[aria-label^="Continue this learning path"], nav[aria-label^="繼續這條學習路徑"]');
    const topicsHeading = page.getByRole('heading', { name: locale === 'en' ? 'Topics' : '主題', exact: true });
    const proseEnd = await page.locator('.prose').evaluate(element => element.getBoundingClientRect().bottom + window.scrollY);
    const navigationEnd = await pathNav.evaluate(element => element.getBoundingClientRect().bottom + window.scrollY);
    const topicsStart = await topicsHeading.evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    expect(topicsStart).toBeGreaterThan(proseEnd);
    expect(topicsStart).toBeGreaterThan(navigationEnd);
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${previous}:`) })).toHaveCount(0);
    await pathNav.getByRole('link', { name: new RegExp(`^${next}:`) }).click();
    await expect(page).toHaveURL(new RegExp(`${base}${locale}/blog/beginner-local-website/$`));
    await page.getByRole('link', { name: switchLanguage, exact: true }).click();
    const other = locale === 'en' ? 'zh-tw' : 'en';
    await expect(page).toHaveURL(new RegExp(`${base}${other}/blog/beginner-local-website/$`));
    await page.getByRole('link', { name: locale === 'en' ? 'English' : '繁體中文', exact: true }).click();
    await pathNav.getByRole('link', { name: new RegExp(`^${next}:`) }).click();
    await expect(page).toHaveURL(new RegExp(`${base}${locale}/blog/beginner-first-change/$`));
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${next}:`) })).toHaveCount(0);
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${previous}:`) })).toBeVisible();
    await expect(page.locator('.prose')).toContainText('src/pages/index.astro');
    await expect(page.locator('.prose')).toContainText('Ctrl+S');
  }
});
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
