import { test } from 'node:test';
import assert from 'node:assert/strict';
import { article, graph } from './fixtures';
import { isCase, orderedPathArticles, publicRoutes, publishedArticles } from '../src/utils/catalog';
test('published catalog filters locale, drafts and archived; sorts deterministically', () => {
  const records = [article({ id: 'z' }), article({ id: 'a' }), article({ id: 'draft', status: 'draft' }), article({ id: 'archived', status: 'archived' }), article({ id: 'zh', locale: 'zh-TW' }), article({ id: 'recent', publishedAt: new Date('2026-01-01') })];
  assert.deepEqual(publishedArticles(records, 'en').map(a => a.id), ['recent', 'a', 'z']);
  assert.equal(records.length, 6);
});
test('LearningPath order survives locale and publication filtering', () => {
  const g = graph();
  g.articles.push(article({ id: 'second' }));
  g['learning-paths'][0]!.sections[0]!.articleIds = ['second', 'article-zh', 'article-en'];
  assert.deepEqual(orderedPathArticles(g['learning-paths'][0]!, g.articles, 'en')[0]!.articles.map(a => a.id), ['second', 'article-en']);
});
test('public route inventory contains only canonical published Articles with base', () => {
  const g = graph();
  g.articles.push(article({ id: 'case', slug: 'incident', contentType: 'case-study' }), article({ id: 'draft', slug: 'private', status: 'draft' }));
  const paths = publicRoutes(g, '/repo/');
  assert.ok(paths.includes('/repo/en/cases/incident/'));
  assert.ok(!paths.includes('/repo/en/blog/incident/'));
  assert.ok(!paths.some(p => p.includes('private')));
  assert.ok(paths.every(p => p.startsWith('/repo/')));
  assert.equal(isCase(g.articles[2]!), true);
  g.articles.push(article({ id: 'collision' }));
  assert.throws(() => publicRoutes(g), /collision/);
});
