import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { article, graph } from './fixtures';
import { orderedPathArticles, pathArticleNavigation } from '../src/utils/catalog';
import { readContent, validateContent } from '../src/utils/content-source';
import { chinese } from '../src/i18n/content';
import { siteConfig } from '../src/config/site';
import { locales } from '../src/i18n';

test('path navigation follows owned section order and skips unpublished or other-locale entries', () => {
  const content = graph();
  const path = content['learning-paths'][0]!;
  content.articles.push(article({ id: 'later', slug: 'later', publishedAt: new Date('2026-09-19') }), article({ id: 'draft', status: 'draft' }), article({ id: 'archived', status: 'archived' }));
  path.sections = [
    { id: 'first', title: 'First', articleIds: ['article-zh', 'article-en', 'draft'] },
    { id: 'second', title: 'Second', articleIds: ['archived', 'later'] },
  ];
  assert.equal(pathArticleNavigation(path, content.articles, 'en', 'article-en')?.previous, undefined);
  assert.equal(pathArticleNavigation(path, content.articles, 'en', 'article-en')?.next?.id, 'later');
  assert.equal(pathArticleNavigation(path, content.articles, 'en', 'later')?.previous?.id, 'article-en');
  assert.equal(pathArticleNavigation(path, content.articles, 'en', 'later')?.next, undefined);
  assert.deepEqual(pathArticleNavigation(path, content.articles, 'zh-TW', 'article-zh'), { previous: undefined, next: undefined });
  for (const id of ['draft', 'archived', 'unknown', 'article-zh']) assert.equal(pathArticleNavigation(path, content.articles, 'en', id), undefined);
});

test('Astro article series preserves bilingual order and teaches declared prerequisites before use', async () => {
  const result = validateContent(await readContent(resolve('src/content')), chinese);
  assert.deepEqual(result.errors, []);
  assert.ok(!result.warnings.some(warning => warning.id === 'W_MISSING_ENTITY_TRANSLATION'));
  const paths = result.graph['learning-paths'];
  for (const id of Object.values(siteConfig.startLearningPathIds)) assert.ok(paths.some(path => path.id === id), `Missing start route: ${id}`);
  const beginner = paths.find(path => path.id === siteConfig.startLearningPathIds.blog)!;
  const translations: string[][] = [];
  for (const locale of locales) {
    const lessons = orderedPathArticles(beginner, result.graph.articles, locale).flatMap(section => section.articles);
    assert.equal(lessons.length, 3);
    assert.deepEqual(lessons[0]?.prerequisiteSkills, []);
    const learned = new Set<string>();
    for (const lesson of lessons) {
      assert.equal(lesson.difficulty, 'intermediate');
      for (const skill of lesson.prerequisiteSkills) assert.ok(learned.has(skill), `${lesson.id} requires ${skill} before it is taught`);
      for (const skill of lesson.skills) learned.add(skill);
    }
    translations.push(lessons.map(lesson => lesson.translationKey));
  }
  assert.deepEqual(translations[0], translations[1]);
  const experienced = paths.find(path => path.id === siteConfig.startLearningPathIds.architecture)!;
  assert.ok(orderedPathArticles(experienced, result.graph.articles, 'en').some(section => section.articles.some(lesson => lesson.difficulty === 'intermediate')));
});
