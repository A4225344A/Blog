import { test } from 'node:test';
import assert from 'node:assert/strict';
import { article, graph } from './fixtures';
import { readingOrder } from '../src/utils/catalog';

test('discovery follows series ownership, filters locale/status and deduplicates membership', () => {
  const first = article({ id: 'first', publishedAt: new Date('2026-01-01') });
  const last = article({ id: 'last', publishedAt: new Date('2026-09-01') });
  const solo = article({ id: 'solo', publishedAt: new Date('2026-08-01') });
  const older = article({ id: 'older', publishedAt: new Date('2026-07-01') });
  const path = graph()['learning-paths'][0]!;
  path.sections[0]!.articleIds = ['first', 'missing', 'private', 'zh', 'last', 'first'];
  const paths = [path, { ...path, id: 'second-path' }];
  const articles = [last, solo, older, first, article({ id: 'private', status: 'draft' }), article({ id: 'zh', locale: 'zh-TW' })];
  assert.deepEqual(readingOrder(articles, paths, 'en').map(a => a.id), ['first', 'last', 'solo', 'older']);
  assert.deepEqual(readingOrder([last, solo], paths, 'en').map(a => a.id), ['last', 'solo']);
  assert.deepEqual(readingOrder(articles, [], 'en').map(a => a.id), ['last', 'solo', 'older', 'first']);
});

test('lower series ID wins overlapping membership regardless of input order', () => {
  const early = graph()['learning-paths'][0]!;
  early.id = 'a-series';
  early.sections[0]!.articleIds = ['first', 'shared'];
  const later = graph()['learning-paths'][0]!;
  later.id = 'z-series';
  later.sections[0]!.articleIds = ['shared', 'last', 'first'];
  const articles = ['shared', 'last', 'first'].map(id => article({ id }));
  for (const paths of [[later, early], [early, later]]) {
    assert.deepEqual(readingOrder(articles, paths, 'en').map(a => a.id), ['first', 'shared', 'last']);
  }
});
