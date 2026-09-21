import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hosting } from '../src/config/hosting';
import { readContent, validateContent } from '../src/utils/content-source';
import { publicRoutes, publishedArticles, sitemapRoutes } from '../src/utils/catalog';
import { articlePath, localePath } from '../src/utils/routes';
import { xmlEscape } from '../src/utils/seo';
import { locales, localePrefix, messages } from '../src/i18n';
import { sections, sectionDescriptions, ui } from '../src/i18n/ui';
import { siteConfig } from '../src/config/site';
import { legacyContentRoutes } from '../src/config/legacy-routes';
import { buildMeasurementId } from '../src/lib/analytics/config';

const { base, site } = hosting(process.env.SITE_URL, process.env.SITE_BASE);
const gaId = buildMeasurementId(true, process.env.PUBLIC_GA_MEASUREMENT_ID);
async function verifyDisabledOutput(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await verifyDisabledOutput(path);
    else if (entry.isFile()) assert.ok(!(await readFile(path)).includes('googletagmanager'), `No Google tag references when disabled: ${path}`);
  }
}
if (!gaId) await verifyDisabledOutput(resolve('dist'));
const { graph } = validateContent(await readContent(resolve('src/content')));
const routes = publicRoutes(graph, base);
const sitemapInventory = new Set(sitemapRoutes(graph, base));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const locale of locales) for (const legacy of legacyContentRoutes) {
  const route = localePath(locale, legacy.from, base);
  const target = localePath(locale, legacy.to, base);
  const html = await readFile(resolve('dist', route.slice(base.length), 'index.html'), 'utf8');
  assert.ok(routes.includes(target) && !routes.includes(route), `Migration target: ${route}`);
  assert.ok(html.includes('name="robots" content="noindex,follow"'), `Migration noindex: ${route}`);
  assert.ok(!html.includes('rel="canonical"'));
  assert.ok(html.includes(`property="og:url" content="${new URL(route, site).href}"`));
  assert.ok(html.includes(`href="${target}"`), `Migration link: ${route}`);
  assert.ok(!html.includes('data-pagefind-body'), `Migration excluded from search: ${route}`);
  assert.ok(!sitemap.includes(`<loc>${xmlEscape(new URL(route, site).href)}</loc>`));
  const rss = await readFile(`dist/${localePrefix[locale]}/rss.xml`, 'utf8');
  assert.ok(!rss.includes(`<link>${new URL(route, site).href}</link>`));
}
const htmlByRoute = new Map<string, string>();
const alternateSets = new Map<string, Record<string, string>>();
const homeCluster: Record<string, string> = {
  ...Object.fromEntries(locales.map(locale => [locale, new URL(localePath(locale, '', base), site).href])),
  'x-default': new URL(base, site).href,
};
const expectedAlternates = new Map<string, Record<string, string>>();
for (const url of Object.values(homeCluster)) expectedAlternates.set(new URL(url).pathname, homeCluster);
const sharedPaths = [...sections, 'search'];
for (const [section, entries] of [['topics', graph.topics], ['learn', graph['learning-paths']], ['projects', graph.projects]] as const)
  for (const entry of entries) sharedPaths.push(`${section}/${encodeURIComponent(entry.id)}`);
for (const path of sharedPaths) {
  const links = Object.fromEntries(locales.filter(locale => sitemapInventory.has(localePath(locale, path, base))).map(locale => [locale, new URL(localePath(locale, path, base), site).href]));
  for (const locale of locales) expectedAlternates.set(localePath(locale, path, base), links);
}
for (const article of publishedArticles(graph.articles)) expectedAlternates.set(articlePath(article, base), Object.fromEntries(
  publishedArticles(graph.articles).filter(other => other.translationKey === article.translationKey).map(other => [other.locale, new URL(articlePath(other, base), site).href]),
));
const indexedRoutes = new Set<string>();
for (const locale of locales) for (const [section, entries] of [['topics', graph.topics], ['learn', graph['learning-paths']], ['projects', graph.projects]] as const)
  for (const entry of entries) {
    const route = localePath(locale, `${section}/${encodeURIComponent(entry.id)}`, base);
    if (sitemapInventory.has(route)) indexedRoutes.add(route);
  }
for (const article of publishedArticles(graph.articles)) indexedRoutes.add(articlePath(article, base));
for (const route of routes) {
  const html = await readFile(resolve('dist', decodeURIComponent(route.slice(base.length)), 'index.html'), 'utf8');
  htmlByRoute.set(route, html);
  const canonical = new URL(route, site).href;
  const analytics = [...html.matchAll(/<meta name="platform-analytics"[^>]*>/g)];
  assert.equal(analytics.length, gaId ? 1 : 0, `Analytics configuration count: ${route}`);
  if (gaId) {
    assert.ok(analytics[0]?.[0].includes(`content="${gaId}"`));
    assert.ok(analytics[0]?.[0].includes(`data-canonical="${canonical}"`));
  }
  assert.equal((html.match(/www\.googletagmanager\.com\/gtag\/js/g) ?? []).length, gaId ? 1 : 0, `Conditional guarded loader: ${route}`);
  if (!gaId) assert.ok(!html.includes('googletagmanager'), `No Google tag references when disabled: ${route}`);
  const indexable = sitemapInventory.has(route);
  if (!indexable) assert.ok(!html.includes('rel="canonical"'), `No canonical on noindex pages: ${route}`);
  assert.equal(html.includes(`rel="canonical" href="${canonical}"`), indexable, `Canonical: ${route}`);
  assert.equal(html.includes('name="robots" content="noindex,follow"'), !indexable, `Indexability: ${route}`);
  assert.ok(html.includes(`property="og:url" content="${canonical}"`));
  assert.equal(sitemap.includes(`<loc>${xmlEscape(canonical)}</loc>`), indexable, `Sitemap: ${route}`);
  assert.ok(html.includes('name="description"'));
  assert.ok(html.includes('property="og:title"'));
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `One h1: ${route}`);
  assert.ok(html.includes('id="main"'));
  assert.ok(html.includes('value="system"'));
  assert.equal(html.includes('data-pagefind-body'), indexedRoutes.has(route), `Search index scope: ${route}`);
  const alternates: Record<string, string> = {};
  for (const tag of html.matchAll(/<link\b[^>]*>/g)) {
    const language = /hreflang="([^"]+)"/.exec(tag[0])?.[1];
    if (!language) continue;
    assert.match(tag[0], /rel="alternate"/);
    assert.ok(!Object.hasOwn(alternates, language), `Duplicate hreflang: ${route}`);
    const href = /href="([^"]+)"/.exec(tag[0])?.[1];
    assert.ok(href);
    alternates[language] = href;
  }
  if (indexable) {
    assert.ok(Object.values(alternates).includes(canonical), `Self hreflang: ${route}`);
    assert.deepEqual(alternates, expectedAlternates.get(route), `Complete hreflang: ${route}`);
    if (Object.values(homeCluster).includes(canonical)) assert.deepEqual(alternates, homeCluster, `Home cluster: ${route}`);
    else assert.ok(!Object.hasOwn(alternates, 'x-default'), `Unrelated home must not join detail cluster: ${route}`);
    alternateSets.set(canonical, alternates);
  } else assert.deepEqual(alternates, {}, `No hreflang on noindex pages: ${route}`);
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
for (const [canonical, alternates] of alternateSets)
  for (const target of Object.values(alternates)) assert.deepEqual(alternateSets.get(target), alternates, `Reciprocal alternates: ${canonical} -> ${target}`);
for (const locale of locales) {
  for (const section of sections) {
    const html = htmlByRoute.get(localePath(locale, section, base));
    assert.ok(html?.includes(`name="description" content="${sectionDescriptions[locale][section]}"`), `Section description: ${locale}/${section}`);
  }
  const home = htmlByRoute.get(localePath(locale, '', base)) ?? '';
  const featured = home.split(`<h2>${ui[locale].featuredTopics}</h2>`)[1]?.split('</section>')[0] ?? '';
  const actualLinks = [...featured.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(actualLinks, siteConfig.featuredTopicIds.filter(id => publishedArticles(graph.articles, locale).some(article => article.topics.includes(id))).map(id => localePath(locale, `topics/${id}`, base)), `Featured order: ${locale}`);
}
for (const locale of ['en', 'zh-TW'] as const) {
  const rss = await readFile(`dist/${locale === 'en' ? 'en' : 'zh-tw'}/rss.xml`, 'utf8');
  assert.equal((rss.match(/<item>/g) ?? []).length, publishedArticles(graph.articles, locale).length);
  assert.ok(rss.includes(`<title>${messages[locale].title}</title>`));
  assert.ok(rss.includes(`<atom:link href="${site}${base}${localePrefix[locale]}/rss.xml" rel="self" type="application/rss+xml"/>`));
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
console.log(`Verified ${routes.length} public pages, reciprocal hreflang clusters, ${indexedRoutes.size} search content markers, featured order, descriptions, assets, sitemap, RSS and generated robots text for ${site}${base}. Live origin-root robots and GitHub settings are not checked.`);
