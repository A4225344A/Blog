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
  console.log('All five populated Astro collections passed the static build.');
} finally {
  for (const file of created) await unlink(file);
}
