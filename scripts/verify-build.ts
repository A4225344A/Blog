import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hosting } from '../src/config/hosting';
import { readContent, validateContent } from '../src/utils/content-source';
import { publicRoutes, publishedArticles } from '../src/utils/catalog';
import { articlePath } from '../src/utils/routes';
import { xmlEscape } from '../src/utils/seo';

const { base, site } = hosting(process.env.SITE_URL, process.env.SITE_BASE);
const { graph } = validateContent(await readContent(resolve('src/content')));
const routes = publicRoutes(graph, base);
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const route of routes) {
  const html = await readFile(resolve('dist', decodeURIComponent(route.slice(base.length)), 'index.html'), 'utf8');
  const canonical = new URL(route, site).href;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `Canonical: ${route}`);
  assert.ok(sitemap.includes(`<loc>${xmlEscape(canonical)}</loc>`), `Sitemap: ${route}`);
  assert.ok(html.includes('name="description"'));
  assert.ok(html.includes('property="og:title"'));
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `One h1: ${route}`);
  assert.ok(html.includes('id="main"'));
  assert.ok(html.includes('value="system"'));
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const value = match[1];
    assert.ok(value);
    const url = new URL(value.replaceAll('&amp;', '&'), canonical);
    if (url.origin !== site) continue;
    assert.ok(url.pathname.startsWith(base), `Unprefixed link: ${value} on ${route}`);
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    await access(resolve('dist', relative, relative.endsWith('/') || relative === '' ? 'index.html' : ''));
  }
}
for (const locale of ['en', 'zh-TW'] as const) {
  const rss = await readFile(`dist/${locale === 'en' ? 'en' : 'zh-tw'}/rss.xml`, 'utf8');
  assert.equal((rss.match(/<item>/g) ?? []).length, publishedArticles(graph.articles, locale).length);
}
for (const article of graph.articles) {
  const route = articlePath(article, base);
  if (article.status === 'published') {
    const html = await readFile(resolve('dist', route.slice(base.length), 'index.html'), 'utf8');
    assert.match(html, /application\/ld\+json/);
    assert.ok(html.includes(article.contentType === 'opinion' ? '"@type":"Article"' : '"@type":"TechArticle"'));
  } else assert.ok(!sitemap.includes(new URL(route, site).href));
}
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${site}${base}sitemap.xml`));
await access('dist/pagefind/pagefind.js');
await access('dist/images/social-card.png');
console.log(`Verified ${routes.length} public pages, canonical/alternate links, assets, sitemap, RSS and robots for ${site}${base}`);
