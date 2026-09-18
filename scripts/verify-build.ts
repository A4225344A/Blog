import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hosting } from '../src/config/hosting';
import { readContent, validateContent } from '../src/utils/content-source';
import { publicRoutes, publishedArticles } from '../src/utils/catalog';
import { articlePath, localePath } from '../src/utils/routes';
import { xmlEscape } from '../src/utils/seo';
import { locales, localePrefix, messages } from '../src/i18n';
import { sections, sectionDescriptions, ui } from '../src/i18n/ui';
import { siteConfig } from '../src/config/site';

const { base, site } = hosting(process.env.SITE_URL, process.env.SITE_BASE);
const { graph } = validateContent(await readContent(resolve('src/content')));
const routes = publicRoutes(graph, base);
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
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
  const links = Object.fromEntries(locales.map(locale => [locale, new URL(localePath(locale, path, base), site).href]));
  for (const locale of locales) expectedAlternates.set(localePath(locale, path, base), links);
}
for (const article of publishedArticles(graph.articles)) expectedAlternates.set(articlePath(article, base), Object.fromEntries(
  publishedArticles(graph.articles).filter(other => other.translationKey === article.translationKey).map(other => [other.locale, new URL(articlePath(other, base), site).href]),
));
const indexedRoutes = new Set<string>();
for (const locale of locales) for (const [section, entries] of [['topics', graph.topics], ['learn', graph['learning-paths']], ['projects', graph.projects]] as const)
  for (const entry of entries) indexedRoutes.add(localePath(locale, `${section}/${encodeURIComponent(entry.id)}`, base));
for (const article of publishedArticles(graph.articles)) indexedRoutes.add(articlePath(article, base));
for (const route of routes) {
  const html = await readFile(resolve('dist', decodeURIComponent(route.slice(base.length)), 'index.html'), 'utf8');
  htmlByRoute.set(route, html);
  const canonical = new URL(route, site).href;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `Canonical: ${route}`);
  assert.ok(sitemap.includes(`<loc>${xmlEscape(canonical)}</loc>`), `Sitemap: ${route}`);
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
  assert.ok(Object.values(alternates).includes(canonical), `Self hreflang: ${route}`);
  assert.deepEqual(alternates, expectedAlternates.get(route), `Complete hreflang: ${route}`);
  if (Object.values(homeCluster).includes(canonical)) assert.deepEqual(alternates, homeCluster, `Home cluster: ${route}`);
  else assert.ok(!Object.hasOwn(alternates, 'x-default'), `Unrelated home must not join detail cluster: ${route}`);
  alternateSets.set(canonical, alternates);
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
  assert.deepEqual(actualLinks, siteConfig.featuredTopicIds.map(id => localePath(locale, `topics/${id}`, base)), `Featured order: ${locale}`);
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
