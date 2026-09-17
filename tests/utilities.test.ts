import { test } from 'node:test';
import assert from 'node:assert/strict';
import { article } from './fixtures';
import { readingMinutes } from '../src/utils/reading-time';
import { hosting, normalizeBase } from '../src/config/hosting';
import { localeFromPrefix } from '../src/i18n';
import { absoluteUrl, articlePath, localePath, translatedArticlePath, withBase } from '../src/utils/routes';
import { parseTheme, resolvedTheme } from '../src/utils/theme';

test('reading time handles English, Han, mixed prose, markup and overrides', () => {
  assert.equal(readingMinutes('word '.repeat(201)), 2);
  assert.equal(readingMinutes('知'.repeat(401)), 2);
  assert.equal(readingMinutes('知'.repeat(400) + ' word'.repeat(200)), 2);
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('```ts\n' + 'code '.repeat(900) + '\n```'), 1);
  assert.equal(readingMinutes('[hello](https://example.com) ![image](image.png)'), 1);
  assert.equal(readingMinutes('hello', 9), 9);
  assert.throws(() => readingMinutes('hello', -1));
});
test('locale mapping is exact', () => {
  assert.equal(localeFromPrefix('zh-tw'), 'zh-TW'); assert.equal(localeFromPrefix('en'), 'en');
  assert.equal(localeFromPrefix('fr'), undefined);
});
for (const base of ['/', '/repository-name/']) test(`canonical routes and asset URLs with base ${base}`, () => {
  assert.equal(localePath('zh-TW', '', base), `${base}zh-tw/`);
  assert.equal(withBase('images/a.svg', base), `${base}images/a.svg`);
  for (const contentType of ['tutorial', 'concept', 'reference', 'opinion', 'troubleshooting', 'case-study'] as const) {
    const section = ['troubleshooting', 'case-study'].includes(contentType) ? 'cases' : 'blog';
    const path = articlePath(article({ contentType }), base);
    assert.equal(path, `${base}en/${section}/intro/`);
    assert.equal(absoluteUrl(path, 'https://example.github.io'), `https://example.github.io${path}`);
  }
});
test('translation uses stable grouping, target slug and canonical type; unpublished fallback is localized home', () => {
  const source = article();
  const target = article({ id: 'other', locale: 'zh-TW', slug: 'translated', contentType: 'case-study' });
  assert.equal(translatedArticlePath(source, 'zh-TW', [target], '/repo/'), '/repo/zh-tw/cases/translated/');
  assert.equal(translatedArticlePath(source, 'zh-TW', [{ ...target, status: 'draft' }], '/repo/'), '/repo/zh-tw/');
  assert.equal(translatedArticlePath(source, 'zh-TW', [], '/repo/'), '/repo/zh-tw/');
});
test('hosting explicitly separates origin and base; invalid paths fail', () => {
  assert.deepEqual(hosting('https://example.github.io', 'repo'), { site: 'https://example.github.io', base: '/repo/' });
  assert.equal(normalizeBase('/'), '/');
  for (const base of ['../repo', '/repo?x', 'https://other.test', 'repo//nested']) assert.throws(() => normalizeBase(base));
  assert.throws(() => hosting('https://example.github.io/repo/'));
  for (const path of ['../secret', '//other.test', 'https://other.test', 'a\\b']) assert.throws(() => withBase(path));
});
test('theme defaults, explicit values, OS changes and invalid storage', () => {
  for (const value of [null, undefined, 'invalid', {}, 'system']) assert.equal(parseTheme(value), 'system');
  assert.equal(parseTheme('light'), 'light'); assert.equal(parseTheme('dark'), 'dark');
  assert.equal(resolvedTheme('system', true), 'dark'); assert.equal(resolvedTheme('system', false), 'light');
  assert.equal(resolvedTheme('light', true), 'light'); assert.equal(resolvedTheme('dark', false), 'dark');
});
