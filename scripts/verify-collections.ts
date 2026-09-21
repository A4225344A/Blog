import { writeFile, unlink, readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { graph } from '../tests/fixtures';
import { article } from '../tests/fixtures';
import { normalizeBase } from '../src/config/hosting';

// Temporary test-only content exercises Astro's real loaders and build graph.
// Exclusive creation and per-file cleanup preserve all existing author content.
const created: string[] = [];
try {
  const fixtures = graph();
  fixtures.topics.push({ id: 'english-only', name: 'English topic', description: 'Locale filtering fixture' });
  fixtures.articles[0]!.topics.push('english-only');
  fixtures.articles.push(article({ id: 'fixture-case', slug: 'fixture-case', contentType: 'case-study' }),
    article({ id: 'fixture-draft', slug: 'fixture-draft', status: 'draft' }),
    article({ id: 'fixture-archived', slug: 'fixture-archived', status: 'archived' }));
  for (const [collection, entries] of Object.entries(fixtures)) {
    for (const entry of entries) {
      const article = collection === 'articles';
      const file = resolve('src/content', collection, `collection-smoke-${entry.id}.${article ? 'md' : 'json'}`);
      const json = JSON.stringify(entry, null, 2);
      await writeFile(file, article ? `---\n${json}\n---\nTest-only Markdown body.\n` : json, { flag: 'wx' });
      created.push(file);
    }
  }
  const result = spawnSync(process.execPath, [resolve('node_modules/astro/astro.js'), 'build'], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Collection fixture build exited ${result.status}`);
  await access('dist/en/cases/fixture-case/index.html');
  await assert.rejects(access('dist/en/blog/fixture-case/index.html'));
  await assert.rejects(access('dist/en/blog/fixture-draft/index.html'));
  await assert.rejects(access('dist/en/blog/fixture-archived/index.html'));
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  assert.ok(sitemap.includes(`${normalizeBase(process.env.SITE_BASE)}en/cases/fixture-case/`));
  assert.ok(!sitemap.includes('fixture-draft'));
  assert.ok(!sitemap.includes('fixture-archived'));
  const rss = await readFile('dist/en/rss.xml', 'utf8');
  assert.ok(rss.includes('fixture-case'));
  assert.ok(!rss.includes('fixture-draft'));
  assert.ok(!rss.includes('fixture-archived'));
  const rendered = await readFile('dist/en/blog/intro/index.html', 'utf8');
  assert.ok(rendered.includes('Test-only Markdown body.'));
  assert.ok(rendered.includes('"@type":"TechArticle"'));
  const base = normalizeBase(process.env.SITE_BASE);
  for (const locale of ['en', 'zh-tw']) {
    const about = await readFile(`dist/${locale}/about/index.html`, 'utf8');
    const home = await readFile(`dist/${locale}/index.html`, 'utf8');
    assert.equal(about.includes(`href="${base}${locale}/cases/"`), locale === 'en', 'Cases are recommended only with published content in this locale');
    assert.equal(home.includes(`href="${base}${locale}/cases/fixture-case/"`), locale === 'en');
    assert.ok(!about.includes('will follow when there is work') && !about.includes('有實作內容後補上'));
    const topic = await readFile(`dist/${locale}/topics/english-only/index.html`, 'utf8');
    assert.equal(topic.includes('data-pagefind-body'), locale === 'en');
    assert.equal(topic.includes('name="robots" content="noindex,follow"'), locale !== 'en');
    assert.equal(sitemap.includes(`${base}${locale}/topics/english-only/`), locale === 'en');
    assert.doesNotMatch(topic, /<link\b[^>]*hreflang="zh-TW"/, 'Empty translation is not an indexing alternate');
  }
  console.log('All five populated Astro collections passed the static build.');
} finally {
  for (const file of created) await unlink(file);
}
