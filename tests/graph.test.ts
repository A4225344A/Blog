import { test } from 'node:test';
import assert from 'node:assert/strict';
import { graph, article } from './fixtures';
import { reverseIndexes, validateGraph } from '../src/utils/graph';
import { validateContent, type RawEntry } from '../src/utils/content-source';
import { schemas, type ContentGraph } from '../src/content/schemas';

test('valid bilingual graph has no diagnostics', () => {
  assert.deepEqual(validateGraph(graph()), { errors: [], warnings: [] });
});
for (const kind of Object.keys(schemas) as (keyof ContentGraph)[]) {
  test(`duplicate stable IDs fail in ${kind}, before loader deduplication`, () => {
    const g = graph();
    const entry = g[kind][0];
    const raw: RawEntry[] = [1, 2].map(n => ({ collection: kind, source: `${n}`, data: entry, body: '' }));
    assert.ok(validateContent(raw).errors.some(e => e.id === 'E_DUPLICATE_ID'));
    // Direct graph consumers also reject duplicate IDs.
    const duplicate = structuredClone(g);
    Object.assign(duplicate, { [kind]: [entry, entry] });
    assert.ok(validateGraph(duplicate).errors.some(e => e.id === 'E_DUPLICATE_ID'));
  });
}
const missing: [string, (g: ContentGraph) => void][] = [
  ['Article Topic', g => { g.articles[0]!.topics = ['missing']; }],
  ['Article Skill', g => { g.articles[0]!.skills = ['missing']; }],
  ['Article prerequisite Skill', g => { g.articles[0]!.prerequisiteSkills = ['missing']; }],
  ['Article recommended Article', g => { g.articles[0]!.recommendedArticles = ['missing']; }],
  ['LearningPath Article', g => { g['learning-paths'][0]!.sections[0]!.articleIds = ['missing']; }],
  ['Project Article', g => { g.projects[0]!.relatedArticles = ['missing']; }],
  ['Project Skill', g => { g.projects[0]!.featuredSkills = ['missing']; }],
  ['Project LearningPath', g => { g.projects[0]!.relatedLearningPaths = ['missing']; }],
];
for (const [name, mutate] of missing) test(`missing ${name} is a hard error`, () => {
  const g = graph(); mutate(g);
  assert.equal(validateGraph(g).errors.filter(e => e.id === 'E_MISSING_REFERENCE').length, 1);
});
for (const field of ['order', 'level', 'learningPaths', 'projects', 'estimatedMinutes']) {
  test(`forbidden Article.${field} survives raw inspection and is rejected`, () => {
    const data = { ...article(), [field]: [] };
    assert.equal(schemas.articles.safeParse(data).success, false);
    assert.ok(validateContent([{ collection: 'articles', source: 'fixture.md', data, body: '' }]).errors.some(e => e.id === 'E_FORBIDDEN_ARTICLE_FIELD'));
  });
}
test('all six warning categories remain nonblocking', () => {
  const g = graph();
  g.articles = [article({ topics: [], skills: [], prerequisiteSkills: ['skill'] })];
  g.projects = []; g['learning-paths'] = []; g.skills[0]!.status = 'deprecated';
  const result = validateGraph(g);
  assert.equal(result.errors.length, 0);
  assert.deepEqual(result.warnings.map(w => w.id).sort(), [
    'W_ARTICLE_NO_TOPIC', 'W_ARTICLE_NO_SKILL', 'W_ARTICLE_NO_PATH', 'W_ARTICLE_NO_PROJECT',
    'W_DEPRECATED_SKILL', 'W_TRANSLATION_SINGLE_LOCALE',
  ].sort());
});
test('draft and archived Articles do not receive published membership warnings', () => {
  for (const status of ['draft', 'archived'] as const) {
    const g = graph(); g.articles.forEach(a => { a.status = status; }); g.projects = []; g['learning-paths'] = [];
    assert.deepEqual(validateGraph(g), { errors: [], warnings: [] });
  }
});
test('reverse indexes deduplicate references and leave ordered membership intact', () => {
  const g = graph();
  g.articles[0]!.recommendedArticles = ['article-zh', 'article-zh'];
  g.articles[0]!.prerequisiteSkills = ['skill'];
  g.skills.push({ ...g.skills[0]!, id: 'dependent', prerequisites: ['skill'] });
  const original = structuredClone(g);
  const reverse = reverseIndexes(g);
  assert.deepEqual(reverse.articles.get('article-zh'), { learningPathIds: ['path'], projectIds: ['project'], incomingRecommendedArticleIds: ['article-en'] });
  assert.deepEqual(reverse.skills.get('skill'), { articleIds: ['article-en', 'article-zh'], dependentSkillIds: ['dependent'], projectIds: ['project'] });
  assert.deepEqual(g, original);
});
test('deferred cycles and empty sections do not become V1 blockers', () => {
  const g = graph(); g.skills[0]!.prerequisites = ['skill']; g.skills[0]!.supersededBy = 'skill';
  g.topics[0]!.parentId = 'topic'; g['learning-paths'][0]!.sections[0]!.articleIds = [];
  assert.equal(validateGraph(g).errors.length, 0);
});
test('schema rejects malformed input and validates all five entities', () => {
  for (const [kind, schema] of Object.entries(schemas)) {
    assert.equal(schema.safeParse({}).success, false, kind);
  }
  assert.equal(schemas.articles.safeParse(article({ estimatedMinutesOverride: 0 })).success, false);
  assert.equal(schemas.articles.safeParse({ ...article(), locale: 'fr' }).success, false);
  assert.equal(schemas.articles.safeParse({ ...article(), publishedAt: 'invalid' }).success, false);
  assert.equal(schemas.articles.safeParse({ ...article(), slug: '../escape' }).success, false);
});
