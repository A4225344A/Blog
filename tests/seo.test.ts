import { test } from 'node:test';
import assert from 'node:assert/strict';
import { article } from './fixtures';
import { aboutJsonLd, articleJsonLd, rssXml, safeJson, sitemapXml, xmlEscape } from '../src/utils/seo';
import { locales, localePrefix, messages } from '../src/i18n';
test('RSS channel titles and Atom self URLs follow locale and hosting base', () => {
  for (const base of ['/', '/Blog/']) for (const locale of locales) {
    const xml = rssXml([], locale, 'https://example.github.io', base);
    assert.ok(xml.includes(`<title>${messages[locale].title}</title>`));
    assert.ok(xml.includes('xmlns:atom="http://www.w3.org/2005/Atom"'));
    assert.ok(xml.includes(`<atom:link href="https://example.github.io${base}${localePrefix[locale]}/rss.xml" rel="self" type="application/rss+xml"/>`));
  }
});
test('RSS filters unpublished/wrong-locale Articles and preserves stable GUIDs', () => {
  const articles = [article({ title: 'A & <B>', description: '"quoted"', publishedAt: new Date('2026-09-01') }), article({ id: 'private', status: 'draft' }), article({ id: 'archived', status: 'archived' }), article({ id: 'zh', locale: 'zh-TW' })];
  const xml = rssXml(articles, 'en', 'https://example.github.io', '/repo/');
  assert.match(xml, /A &amp; &lt;B&gt;/);
  assert.match(xml, /https:\/\/example.github.io\/repo\/en\/blog\/intro\//);
  assert.match(xml, /<guid isPermaLink="false">article-en<\/guid>/);
  assert.equal((xml.match(/<item>/g) ?? []).length, 1);
  assert.ok(!xml.includes('private'));
});
test('JSON-LD escapes script termination and uses canonical Article URL', () => {
  const data = articleJsonLd(article({ title: '</script><script>alert(1)</script>' }), 'https://example.github.io', '/repo/');
  assert.equal(data['@type'], 'TechArticle');
  assert.equal(data.url, 'https://example.github.io/repo/en/blog/intro/');
  assert.ok(!safeJson(data).includes('<'));
  assert.deepEqual(JSON.parse(safeJson(data)), data);
  assert.equal(articleJsonLd(article({ contentType: 'opinion' }), 'https://example.github.io', '/')['@type'], 'Article');
});
test('sitemap emits absolute URLs and XML escaping is deterministic', () => {
  assert.match(sitemapXml(['/repo/en/'], 'https://example.github.io'), /<loc>https:\/\/example.github.io\/repo\/en\/<\/loc>/);
  assert.equal(xmlEscape('<>&"\''), '&lt;&gt;&amp;&quot;&apos;');
});

test('author identity connects both locales, articles and RSS without exposing email', () => {
  for (const base of ['/', '/Blog/']) for (const locale of locales) {
    const person = aboutJsonLd(locale, 'https://example.github.io', base);
    const data = articleJsonLd(article({ locale }), 'https://example.github.io', base);
    assert.deepEqual(data.author, data.publisher);
    assert.equal(data.author['@id'], person['@id']);
    assert.equal(person['@id'], `https://example.github.io${base}zh-tw/about/#author`);
    assert.equal(person.url, `https://example.github.io${base}${localePrefix[locale]}/about/`);
    assert.deepEqual(person.alternateName, ['Jacky', '謝宇逸']);
    const xml = rssXml([article({ locale })], locale, 'https://example.github.io', base);
    assert.ok(xml.includes('xmlns:dc="http://purl.org/dc/elements/1.1/"'));
    assert.equal(xml.split(`<dc:creator>${person.name}</dc:creator>`).length - 1, 2);
    assert.ok(!xml.includes('<author>'));
  }
});

test('sitemap dates use supplied content dates only', () => {
  const xml = sitemapXml(['/en/', '/en/blog/intro/'], 'https://example.github.io', new Map([
    ['/en/blog/intro/', new Date('2026-09-24')],
  ]));
  assert.equal((xml.match(/<lastmod>/g) ?? []).length, 1);
  assert.ok(xml.includes('/en/</loc></url>'));
  assert.ok(xml.includes('/en/blog/intro/</loc><lastmod>2026-09-24T00:00:00.000Z</lastmod>'));
});
