import { test, expect } from '@playwright/test';
import { normalizeBase } from '../../src/config/hosting';
const base = normalizeBase(process.env.SITE_BASE);

test('discovery topic order is consistent and example URLs are not clickable', async ({ page }) => {
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/`);
    const homeLinks = await page.locator('.topic-directory a').evaluateAll(links => links.map(link => link.getAttribute('href')));
    for (const section of ['topics', 'start']) {
      await page.goto(`${locale}/${section}/`);
      const links = await page.locator(`main a[href^="${base}${locale}/topics/"]`).evaluateAll(links => links.map(link => link.getAttribute('href')));
      expect(links).toEqual(homeLinks);
    }
    await page.goto(`${locale}/blog/astro-knowledge-platform/`);
    await expect(page.locator('.prose a[href^="https://name.github.io"]')).toHaveCount(0);
    await expect(page.locator('.prose code').filter({ hasText: 'https://name.github.io' }).first()).toBeVisible();
  }
});

test('old links explain the rewrite and empty cases are not recommended', async ({ page }) => {
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/blog/beginner-tools/`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    expect(new URL((await page.locator('meta[property="og:url"]').getAttribute('content'))!).pathname).toBe(`${base}${locale}/blog/beginner-tools/`);
    const replacement = page.locator(`main a[href="${base}${locale}/blog/why-astro/"]`);
    await expect(replacement).toBeVisible();
    await replacement.click();
    await expect(page).toHaveURL(new RegExp(`${locale}/blog/why-astro/$`));
    await page.goto(`${locale}/about/`);
    await expect(page.locator(`a[href="${base}${locale}/cases/"]`)).toHaveCount(0);
    await expect(page.locator('.profile-intro h1')).toHaveText(locale === 'en' ? 'About Jacky (謝宇逸)' : '關於 Jacky（謝宇逸）');
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/about-${locale}.png`, fullPage: true });
    await page.goto(`${locale}/topics/sre/`);
    await expect(page.locator('[data-pagefind-body]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  }
  await page.goto('./');
  await expect(page.getByText('Choose your language', { exact: true })).toHaveAttribute('lang', 'en');
  await expect(page.locator('main').getByRole('link', { name: 'English', exact: true })).toHaveAttribute('lang', 'en');
});

test('author avatars link to GitHub and the blog layout fits both screen sizes', async ({ page }) => {
  for (const locale of ['zh-tw', 'en']) {
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: width === 375 ? 'dark' : 'light' });
      for (const route of ['', 'blog/why-astro/']) {
        await page.goto(`${locale}/${route}`);
        const avatar = page.locator('.avatar-link');
        await expect(avatar).toHaveAttribute('href', 'https://github.com/A4225344A');
        const authorName = locale === 'zh-tw' ? 'Jacky（謝宇逸）' : 'Jacky (謝宇逸)';
        await expect(avatar).toHaveAccessibleName(locale === 'zh-tw' ? `${authorName} 的 GitHub` : `${authorName} on GitHub`);
        await expect(page.locator('.author-name')).toHaveText(authorName);
        await expect(avatar.locator('img')).toHaveAttribute('src', `${base}images/avatar.png`);
        expect(await avatar.locator('img').evaluate(img => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)).toBe(true);
        await avatar.focus();
        await expect(avatar).toBeFocused();
        await expect(page.locator('.sidebar .stats strong')).toHaveText(['5', '2', '1']);
        expect(await page.locator('body').evaluate(element => getComputedStyle(element).color)).toBe(width === 375 ? 'rgb(227, 229, 240)' : 'rgb(51, 56, 77)');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (locale === 'zh-tw') await page.screenshot({ path: `test-results/blog-${route ? 'article' : 'home'}-${width}.png`, fullPage: true });
      }
    }
  }
});

test('the personal blog leads with articles and projects and retains static diagrams', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [locale, articleLabel, projectLabel, seriesLabel] of [['en', 'Latest articles', 'Featured project', 'Article series'], ['zh-tw', '最新文章', '精選專案', '文章系列']] as const) {
    await page.goto(`http://127.0.0.1:4322${base}${locale}/`);
    const headings = await page.locator('main h2').allTextContents();
    expect(headings.indexOf(articleLabel)).toBeGreaterThanOrEqual(0);
    expect(headings.indexOf(articleLabel)).toBeLessThan(headings.indexOf(projectLabel));
    expect(headings.indexOf(projectLabel)).toBeLessThan(headings.indexOf(seriesLabel));
    await expect(page.locator('main')).toContainText(locale === 'en' ? 'full-stack engineer' : '全端工程師');
    await expect(page.locator('.site-brand')).toContainText(locale === 'en' ? 'From Full-Stack to Cloud Native' : '從全端到雲原生');
    if (locale === 'zh-tw') await page.screenshot({ path: 'test-results/personal-blog-home.png', fullPage: true });
    for (const slug of ['why-astro', 'astro-project-setup', 'astro-content-and-layout', 'astro-github-pages']) {
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: width === 375 ? 'dark' : 'light' });
        await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/${slug}/`);
        const figure = page.locator('figure.learning-diagram');
        if (slug === 'why-astro') {
          await expect(figure).toBeVisible();
          await expect(figure.locator('li')).toHaveCount(3);
          expect(await figure.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
        }
        await expect(page.locator('.prose')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
    }
  }
  await context.close();
});

test('readers can follow the Astro series and switch languages without losing their place', async ({ page }) => {
  for (const [locale, beginner, experienced, firstTitle, next, previous, switchLanguage] of [
    ['zh-tw', '這個部落格如何建立', '探索專案與文章', '為什麼我用 Astro 建立技術部落格', '下一篇', '上一篇', 'English'],
    ['en', 'How this blog is built', 'Explore projects and articles', 'Why I use Astro for a technical blog', 'Next article', 'Previous article', '繁體中文'],
  ] as const) {
    const separator = locale === 'zh-tw' ? '：' : ': ';
    await page.goto(`${locale}/start/`);
    const entry = page.getByRole('region', { name: beginner });
    await expect(page.getByRole('region', { name: experienced })).toBeVisible();
    await entry.getByRole('link').click();
    await expect(page).toHaveURL(`${new URL(page.url()).origin}${base}${locale}/learn/knowledge-platform/`);
    await expect(page.locator('main ol.cards li')).toHaveCount(5);
    await page.locator('main').getByRole('link', { name: firstTitle, exact: true }).click();
    await expect(page.locator('h1')).toHaveText(firstTitle);
    const pathNav = page.locator('nav[aria-label^="Continue this series"], nav[aria-label^="繼續閱讀系列"]');
    await expect(pathNav).toHaveAttribute('aria-label', new RegExp(`^${locale === 'en' ? 'Continue this series' : '繼續閱讀系列'}${separator}`));
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${locale === 'en' ? 'Back to the series' : '回到文章系列'}${separator}`) })).toBeVisible();
    const proseEnd = await page.locator('.prose').evaluate(element => element.getBoundingClientRect().bottom + window.scrollY);
    const navigationStart = await pathNav.evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    expect(navigationStart).toBeGreaterThanOrEqual(proseEnd);
    for (const label of locale === 'en' ? ['Topics', 'Skills', 'Prerequisite skills', 'Article series'] : ['主題', '技能', '先備技能', '文章系列'])
      await expect(page.locator('main').getByRole('heading', { name: label, exact: true })).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(locale === 'en' ? 'min read' : '分鐘閱讀');
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${previous}${separator}`) })).toHaveCount(0);
    await pathNav.getByRole('link', { name: new RegExp(`^${next}${separator}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${base}${locale}/blog/astro-project-setup/$`));
    await page.getByRole('link', { name: switchLanguage, exact: true }).click();
    const other = locale === 'en' ? 'zh-tw' : 'en';
    await expect(page).toHaveURL(new RegExp(`${base}${other}/blog/astro-project-setup/$`));
    await page.getByRole('link', { name: locale === 'en' ? 'English' : '繁體中文', exact: true }).click();
    await pathNav.getByRole('link', { name: new RegExp(`^${next}${separator}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${base}${locale}/blog/astro-content-and-layout/$`));
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${next}${separator}`) })).toHaveAttribute('href', `${base}${locale}/blog/astro-github-pages/`);
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${previous}${separator}`) })).toBeVisible();
    await expect(page.locator('.prose')).toContainText('src/pages/index.astro');
    await expect(page.locator('.prose')).toContainText('Ctrl+S');
    await pathNav.getByRole('link', { name: new RegExp(`^${next}${separator}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${base}${locale}/blog/astro-github-pages/$`));
    await expect(page.locator('.prose')).toContainText(locale === 'en' ? 'Home returns to the /Blog/ home page (or your configured base)' : 'Home 連結會返回 /Blog/（或你設定的 base）首頁');
    await expect(pathNav.getByRole('link', { name: new RegExp(`^${next}${separator}`) })).toHaveAttribute('href', `${base}${locale}/blog/astro-knowledge-platform/`);
    await page.getByRole('link', { name: switchLanguage, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${base}${other}/blog/astro-github-pages/$`));
  }
});

test('the former combined tutorial links to both replacement articles', async ({ page }) => {
  for (const locale of ['zh-tw', 'en']) {
    await page.goto(`${locale}/blog/astro-content-and-deployment/`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    for (const slug of ['astro-content-and-layout', 'astro-github-pages']) {
      const target = `${base}${locale}/blog/${slug}/`;
      await page.locator(`main a[href="${target}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(page.locator('.prose')).toBeVisible();
      await page.goBack();
    }
  }
});
test('article TOC is reachable before mobile prose without JavaScript and appears only once', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    for (const locale of ['zh-tw', 'en']) {
      for (const width of [375, 960, 961, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/why-astro/`);
        const mobile = page.locator('.mobile-toc');
        const desktop = page.locator('.sidebar .toc');
        const active = width <= 960 ? mobile : desktop;
        const hidden = width <= 960 ? desktop : mobile;
        await expect(active).toBeVisible();
        await expect(hidden).toBeHidden();
        const label = await active.getAttribute('aria-label');
        expect(label).toBeTruthy();
        await expect(page.getByRole('navigation', { name: label!, exact: true })).toHaveCount(1);
        if (width <= 960) {
          expect(await mobile.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(
            await page.locator('.prose').evaluate(element => element.getBoundingClientRect().top));
          await expect(mobile).toHaveAttribute('data-pagefind-ignore', '');
        }
        const firstLink = active.getByRole('link').first();
        const target = await page.locator('.prose h2').first().getAttribute('id');
        await expect(firstLink).toHaveAttribute('href', `#${target}`);
        await firstLink.focus();
        await expect(firstLink).toBeFocused();
        await page.keyboard.press('Enter');
        expect(decodeURIComponent(new URL(page.url()).hash)).toBe(`#${target}`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width === 375) {
          await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/why-astro/`);
          await page.screenshot({ path: `test-results/mobile-toc-${locale}.png`, fullPage: true });
        }
      }
    }
  } finally {
    await context.close();
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
test('author is discoverable by Chinese name in both locale search indexes', async ({ page }) => {
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/search/`);
    await page.locator('.pagefind-ui__search-input').fill('謝宇逸');
    const result = page.locator(`.pagefind-ui__result-link[href="${base}${locale}/about/"]`).first();
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const loadMore = page.locator('.pagefind-ui__button');
    for (let i = 0; i < 10 && await result.count() === 0; i++) {
      if (!await loadMore.isVisible()) break;
      const before = await page.locator('.pagefind-ui__result-link').count();
      await loadMore.click();
      await expect.poll(() => page.locator('.pagefind-ui__result-link').count()).toBeGreaterThan(before);
    }
    await expect(result).toBeVisible();
    await result.click();
    await expect(page.locator('h1')).toContainText('謝宇逸');
    await page.goto(`${locale}/learn/knowledge-platform/`);
    await expect(page.locator('.article-list time')).toHaveCount(0);
    await page.goto(`${locale}/blog/astro-github-pages/`);
    await expect(page.locator('.learning-diagram svg')).toBeVisible();
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.learning-diagram').screenshot({ path: `test-results/deployment-flow-${locale}.png` });
  }
});

test('topic filters and series order work without JavaScript and diagrams follow the theme', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const page = await context.newPage();
  try {
    for (const locale of ['en', 'zh-tw']) {
      await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/`);
      await expect(page.locator('.article-title').first()).toHaveAttribute('href', `${base}${locale}/blog/why-astro/`);
      await expect(page.locator('.series-position').first()).toContainText(locale === 'en' ? 'Part 1 of 5' : '第 1 / 5 篇');
      await page.locator(`.topic-filter a[href="${base}${locale}/topics/web-foundations/"]`).click();
      await expect(page.locator('.article-title').first()).toHaveAttribute('href', `${base}${locale}/blog/why-astro/`);
      await page.locator(`.topic-filter a[href="${base}${locale}/topics/platform-engineering/"]`).click();
      await expect(page.locator('.article-title')).toHaveCount(1);
      await expect(page.locator('.series-position')).toContainText(locale === 'en' ? 'Part 5 of 5' : '第 5 / 5 篇');
      await page.locator(`.topic-filter a[href="${base}${locale}/blog/"]`).click();
      await expect(page.locator('.article-title')).toHaveCount(5);
      await page.screenshot({ path: `test-results/reading-list-${locale}.png`, fullPage: true });
      for (const mode of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme: mode });
        await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/astro-github-pages/`);
        const svg = page.locator('.learning-diagram svg');
        const fill = await svg.evaluate(element => {
          const rect = element.querySelector('rect');
          if (!rect) throw new Error('Missing diagram node');
          return getComputedStyle(rect).fill;
        });
        expect(fill).toBe(mode === 'dark' ? 'rgb(34, 37, 56)' : 'rgb(255, 255, 255)');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await svg.screenshot({ path: `test-results/reading-flow-${locale}-${mode}.png` });
      }
    }
  } finally { await context.close(); }
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
  await expect(page.locator('h1')).toHaveText('Organizing bilingual articles, series and search with Astro');
  await page.getByRole('link', { name: '繁體中文', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}zh-tw/blog/astro-knowledge-platform/$`));
  await expect(page.locator('h1')).toHaveText('用 Astro 整理雙語文章、系列與搜尋');
  await expect(page.locator('.toc a').first()).toBeVisible();
  for (const [locale, query] of [['en', 'Astro content modeling'], ['zh-tw', '內容建模']]) {
    await page.goto(`${locale}/search/`);
    await page.locator('.pagefind-ui__search-input').fill(query ?? '');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const articleResult = page.locator(`.pagefind-ui__result-link[href="${base}${locale}/blog/astro-knowledge-platform/"]`).first();
    // Ranking changes as content grows; verify discovery across actual UI pages.
    const loadMore = page.locator('.pagefind-ui__button');
    for (let pageNumber = 0; pageNumber < 10 && await articleResult.count() === 0; pageNumber++) {
      if (!await loadMore.isVisible()) break;
      const previousCount = await page.locator('.pagefind-ui__result-link').count();
      await loadMore.click();
      await expect.poll(() => page.locator('.pagefind-ui__result-link').count()).toBeGreaterThan(previousCount);
    }
    await expect(articleResult).toBeVisible();
    for (const href of await page.locator('.pagefind-ui__result-link').evaluateAll(links => links.map(link => link.getAttribute('href'))))
      expect(href).toMatch(new RegExp(`${base}${locale}/(?:blog|cases|topics|learn|projects)/[^/]+/$`));
  }
});

test('detail pages localize metadata and omit empty optional relationships', async ({ page }) => {
  for (const [locale, difficulty, recommended, projects, related, paths] of [
    ['en', 'Intermediate', 'Recommended reading', 'Projects', 'Related articles', 'Related series'],
    ['zh-tw', '中階', '延伸閱讀', '專案', '相關文章', '相關系列'],
  ] as const) {
    await page.goto(`${locale}/blog/astro-knowledge-platform/`);
    await expect(page.locator('main')).not.toContainText(difficulty);
    await expect(page.getByRole('heading', { name: recommended, exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: projects, exact: true })).toHaveCount(0);
    await page.goto(`${locale}/projects/ai-sre-platform/`);
    await expect(page.getByRole('heading', { name: related, exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: paths, exact: true })).toHaveCount(0);
    await expect(page.locator('main')).toContainText(locale === 'en' ? 'Maturity: Lab' : '成熟度：實驗室（lab）');
    await page.goto(`${locale}/learn/knowledge-platform/`);
    await expect(page.locator('.cards')).not.toContainText(difficulty);
    await expect(page.locator('main')).toContainText(locale === 'en' ? 'For: Engineers · Technical writers' : '適合對象：工程師 · 技術寫作者');
  }
});
