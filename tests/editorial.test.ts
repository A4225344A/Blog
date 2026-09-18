import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entityText, sectionText, pathAudience, validateEntityTranslations, type EntityTranslations } from '../src/i18n/content';
import { difficultyLabels, maturityLabels, sectionDescriptions } from '../src/i18n/ui';
import { resolveOrderedIds } from '../src/utils/catalog';
import { validateContent, type RawEntry } from '../src/utils/content-source';
import { article, graph } from './fixtures';

test('entity and section translation namespaces cannot leak across collections', () => {
  const source = { id: 'platform-engineering', name: 'Source skill', description: 'Source description' };
  assert.equal(entityText('topics', source, 'zh-TW').title, '平台工程');
  assert.equal(entityText('skills', source, 'zh-TW').title, 'Source skill');
  assert.equal(entityText('topics', source, 'en').title, 'Source skill');
  const section = { id: 'foundation', title: 'Source section', articleIds: [] };
  assert.equal(sectionText('knowledge-platform', section, 'zh-TW').title, '從完整範例開始');
  assert.equal(sectionText('another-path', section, 'zh-TW').title, 'Source section');
});
test('missing translations warn; stale collection and path-section keys fail', () => {
  const content = graph();
  const translations: EntityTranslations = { topics: {}, skills: {}, 'learning-paths': {}, projects: {} };
  assert.equal(validateEntityTranslations(content, translations).errors.length, 0);
  assert.equal(validateEntityTranslations(content, translations).warnings.length, 5);
  translations.topics.stale = { title: 'Stale', description: 'Unknown' };
  translations['learning-paths'].path = { title: 'Path', description: 'Path', sections: { stale: { title: 'Section', description: 'Unknown' } } };
  const result = validateEntityTranslations(content, translations);
  assert.deepEqual(result.errors.map(error => error.entity), ['topics/stale', 'learning-paths/path/stale']);
  assert.ok(result.errors.every(error => error.id === 'E_UNKNOWN_ENTITY_TRANSLATION'));
  assert.ok(result.warnings.every(warning => warning.id === 'W_MISSING_ENTITY_TRANSLATION'));
});
test('audience, difficulty and maturity use localized display text', () => {
  const path = { ...graph()['learning-paths'][0]!, id: 'knowledge-platform', targetAudience: ['Engineers', 'Technical writers'] };
  assert.deepEqual(pathAudience(path, 'zh-TW'), ['工程師', '技術寫作者']);
  assert.deepEqual(pathAudience(path, 'en'), ['Engineers', 'Technical writers']);
  assert.equal(difficultyLabels['zh-TW'].beginner, '初階');
  assert.equal(maturityLabels['zh-TW'].lab, '實驗室（lab）');
  for (const descriptions of Object.values(sectionDescriptions)) assert.equal(new Set(Object.values(descriptions)).size, 7);
});
test('featured order follows configured IDs despite shuffled collection input', () => {
  assert.deepEqual(resolveOrderedIds(['b', 'missing', 'a'], [{ id: 'c' }, { id: 'a' }, { id: 'b' }]), [{ id: 'b' }, { id: 'a' }]);
});
test('public route collision reports both source files; locale, section and drafts remain distinct', () => {
  const entry = (source: string, overrides: Parameters<typeof article>[0]): RawEntry => ({ collection: 'articles', source, data: article(overrides), body: '' });
  const first = entry('articles/first.md', {});
  const result = validateContent([first, entry('articles/second.md', { id: 'second' })]);
  const collision = result.errors.find(error => error.id === 'E_ROUTE_COLLISION');
  assert.equal(collision?.entity, 'articles/second.md');
  assert.match(collision?.message ?? '', /\/en\/blog\/intro\/.*articles\/first.md/);
  for (const overrides of [{ locale: 'zh-TW' }, { contentType: 'case-study' }, { status: 'draft' }, { status: 'archived' }] as const)
    assert.ok(!validateContent([first, entry('other.md', { id: 'other', ...overrides })]).errors.some(error => error.id === 'E_ROUTE_COLLISION'));
});
