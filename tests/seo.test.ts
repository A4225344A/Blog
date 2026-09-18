import { test } from 'node:test';
import assert from 'node:assert/strict';
import { article } from './fixtures';
import { articleJsonLd, rssXml, safeJson, sitemapXml, xmlEscape } from '../src/utils/seo';
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
