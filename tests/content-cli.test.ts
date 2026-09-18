import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { article } from './fixtures';
import { schemas } from '../src/content/schemas';
import { readContent, validateContent } from '../src/utils/content-source';

test('actual CLI exits zero for warnings and nonzero for duplicate, missing and forbidden references', async () => {
  const root = await mkdtemp(join(tmpdir(), 'knowledge-content-'));
  try {
    for (const kind of Object.keys(schemas)) await mkdir(join(root, kind));
    const file = join(root, 'articles', 'a.md');
    const writeArticle = async (data: unknown, target = file) => writeFile(target, `---\n${JSON.stringify(data)}\n---\nFixture body.\n`);
    const run = () => spawnSync(process.execPath, ['--import', 'tsx', resolve('scripts/validate-content.ts'), root], { encoding: 'utf8' });
    await writeArticle(article({ topics: [], skills: [] }));
    let result = run(); assert.equal(result.status, 0, result.stderr); assert.match(result.stderr, /W_ARTICLE_NO_TOPIC/);
    const read = await readContent(root); assert.equal(read[0]?.body, 'Fixture body.\n');
    assert.equal(validateContent(read).graph.articles[0]?.id, 'article-en');
    await writeArticle(article({ topics: ['missing'], skills: [] }));
    result = run(); assert.equal(result.status, 1); assert.match(result.stderr, /E_MISSING_REFERENCE/);
    await writeArticle({ ...article(), learningPaths: [] });
    result = run(); assert.equal(result.status, 1); assert.match(result.stderr, /E_FORBIDDEN_ARTICLE_FIELD/);
    await writeArticle(article({ topics: [], skills: [] }));
    await writeArticle(article({ topics: [], skills: [] }), join(root, 'articles', 'duplicate.md'));
    result = run(); assert.equal(result.status, 1); assert.match(result.stderr, /E_DUPLICATE_ID/);
    await writeArticle(article({ id: 'different', topics: [], skills: [] }), join(root, 'articles', 'duplicate.md'));
    result = run(); assert.equal(result.status, 1); assert.match(result.stderr, /E_ROUTE_COLLISION.*articles\/duplicate.md.*articles\/a.md/);
    await writeFile(file, '---\nid: one\nid: two\n---\n');
    result = run(); assert.equal(result.status, 1); assert.match(result.stderr, /E_CONTENT_READ/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
