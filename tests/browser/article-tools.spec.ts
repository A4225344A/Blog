import { test, expect } from '@playwright/test';
import { normalizeBase } from '../../src/config/hosting';
const base = normalizeBase(process.env.SITE_BASE);

test('code copies exact text and a denied clipboard keeps code readable', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/blog/astro-project-setup/`);
    const block = page.locator('.code-block').first();
    const text = await block.locator('code').textContent();
    await block.getByRole('button').focus();
    await page.keyboard.press('Enter');
    await expect(block.getByRole('status')).toHaveText(locale === 'en' ? 'Copied' : '已複製');
    // Windows normalizes clipboard line endings to CRLF; code content must match.
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(text?.replace(/\r\n/g, '\n'));
    await page.evaluate(() => {
      Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('Permission denied'); } });
    });
    await block.getByRole('button').click();
    await expect(block.getByRole('status')).toContainText(locale === 'en' ? 'copy it manually' : '手動複製');
    await expect(block.locator('code')).toHaveText(text ?? '');
    await expect(block.getByRole('button')).toBeEnabled();
  }
});

test('diagram enlargement supports keyboard dismissal and mobile scrolling in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const locale of ['en', 'zh-tw']) {
    await page.goto(`${locale}/blog/astro-github-pages/`);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
      const trigger = page.getByRole('button', { name: locale === 'en' ? 'Enlarge diagram' : '放大流程圖' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button')).toBeFocused();
      const viewport = dialog.getByRole('region');
      await viewport.focus();
      expect(await viewport.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => viewport.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/diagram-zoom-${locale}-${theme}.png` });
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await dialog.getByRole('button').click();
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
  }
});

test('series entry and empty indexes work without JavaScript; original code and diagrams remain readable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  try {
    for (const locale of ['en', 'zh-tw']) {
      await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/`);
      const start = page.locator('.series-start a');
      await expect(start).toHaveAttribute('href', `${base}${locale}/blog/why-astro/`);
      await start.click();
      await expect(page).toHaveURL(new RegExp(`${locale}/blog/why-astro/$`));
      await page.goto(`http://127.0.0.1:4322${base}${locale}/blog/astro-github-pages/`);
      await expect(page.locator('.prose pre').first()).toBeVisible();
      await expect(page.locator('.learning-diagram svg')).toBeVisible();
      await expect(page.locator('.learning-diagram svg')).toHaveAttribute('viewBox', '0 0 400 610');
      await expect(page.locator('.code-toolbar, .diagram-zoom')).toHaveCount(0);
      for (const path of ['cases', 'topics/cloud-native', 'topics/sre', 'topics/ai-engineering', 'topics/backend-engineering']) {
        await page.goto(`http://127.0.0.1:4322${base}${locale}/${path}/`);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
        await expect(page.locator('main')).not.toContainText(locale === 'en' ? 'reading order' : '依閱讀順序');
      }
    }
  } finally { await context.close(); }
});
