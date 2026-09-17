import type { ContentGraph } from '../content/schemas';

export interface Diagnostic { id: string; entity: string; message: string }
export interface ArticleReverseIndex {
  learningPathIds: string[]; projectIds: string[]; incomingRecommendedArticleIds: string[];
}
export interface SkillReverseIndex { articleIds: string[]; dependentSkillIds: string[]; projectIds: string[] }

export function reverseIndexes(graph: ContentGraph) {
  const articles = new Map<string, ArticleReverseIndex>();
  const skills = new Map<string, SkillReverseIndex>();
  for (const a of graph.articles) articles.set(a.id, { learningPathIds: [], projectIds: [], incomingRecommendedArticleIds: [] });
  for (const s of graph.skills) skills.set(s.id, { articleIds: [], dependentSkillIds: [], projectIds: [] });
  const add = (list: string[] | undefined, id: string) => { if (list && !list.includes(id)) list.push(id); };
  for (const p of graph['learning-paths']) for (const section of p.sections)
    for (const id of section.articleIds) add(articles.get(id)?.learningPathIds, p.id);
  for (const p of graph.projects) {
    for (const id of p.relatedArticles) add(articles.get(id)?.projectIds, p.id);
    for (const id of p.featuredSkills) add(skills.get(id)?.projectIds, p.id);
  }
  for (const a of graph.articles) {
    for (const id of a.recommendedArticles) add(articles.get(id)?.incomingRecommendedArticleIds, a.id);
    for (const id of [...a.skills, ...a.prerequisiteSkills]) add(skills.get(id)?.articleIds, a.id);
  }
  for (const s of graph.skills) for (const id of s.prerequisites) add(skills.get(id)?.dependentSkillIds, s.id);
  return { articles, skills };
}

export function validateGraph(graph: ContentGraph) {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  for (const [kind, entries] of Object.entries(graph)) {
    const seen = new Set<string>();
    for (const entry of entries) {
      if (seen.has(entry.id)) errors.push({ id: 'E_DUPLICATE_ID', entity: `${kind}:${entry.id}`, message: 'Duplicate stable ID' });
      seen.add(entry.id);
    }
  }
  const targets = {
    articles: new Set(graph.articles.map(x => x.id)), topics: new Set(graph.topics.map(x => x.id)),
    skills: new Set(graph.skills.map(x => x.id)), 'learning-paths': new Set(graph['learning-paths'].map(x => x.id)),
  };
  const check = (entity: string, field: string, refs: string[], kind: keyof typeof targets) => {
    for (const ref of refs) if (!targets[kind].has(ref))
      errors.push({ id: 'E_MISSING_REFERENCE', entity, message: `${field} references missing ${kind}:${ref}` });
  };
  const warn = (id: string, entity: string, message: string) => warnings.push({ id, entity, message });
  const reverse = reverseIndexes(graph);
  for (const a of graph.articles) {
    for (const field of ['order', 'level', 'learningPaths', 'projects', 'estimatedMinutes'])
      if (Object.hasOwn(a, field)) errors.push({ id: 'E_FORBIDDEN_ARTICLE_FIELD', entity: a.id, message: field });
    check(a.id, 'topics', a.topics, 'topics');
    check(a.id, 'skills', a.skills, 'skills');
    check(a.id, 'prerequisiteSkills', a.prerequisiteSkills, 'skills');
    check(a.id, 'recommendedArticles', a.recommendedArticles, 'articles');
    if (!a.topics.length) warn('W_ARTICLE_NO_TOPIC', a.id, 'Article has no Topic');
    if (!a.skills.length) warn('W_ARTICLE_NO_SKILL', a.id, 'Article has no Skill');
    if (a.status === 'published') {
      if (!reverse.articles.get(a.id)?.learningPathIds.length) warn('W_ARTICLE_NO_PATH', a.id, 'Published Article is not in a LearningPath');
      if (!reverse.articles.get(a.id)?.projectIds.length) warn('W_ARTICLE_NO_PROJECT', a.id, 'Published Article is not in a Project');
    }
  }
  for (const p of graph['learning-paths']) for (const section of p.sections) check(p.id, `sections.${section.id}.articleIds`, section.articleIds, 'articles');
  for (const p of graph.projects) {
    check(p.id, 'relatedArticles', p.relatedArticles, 'articles');
    check(p.id, 'featuredSkills', p.featuredSkills, 'skills');
    check(p.id, 'relatedLearningPaths', p.relatedLearningPaths, 'learning-paths');
  }
  for (const s of graph.skills) {
    const refs = reverse.skills.get(s.id);
    if (s.status === 'deprecated' && (refs?.articleIds.length || refs?.dependentSkillIds.length || refs?.projectIds.length || graph.skills.some(other => other.supersededBy === s.id)))
      warn('W_DEPRECATED_SKILL', s.id, 'Deprecated Skill is still referenced');
  }
  const translations = new Map<string, Set<string>>();
  for (const a of graph.articles) {
    const locales = translations.get(a.translationKey) ?? new Set<string>();
    locales.add(a.locale); translations.set(a.translationKey, locales);
  }
  for (const [key, locales] of translations) if (locales.size === 1) warn('W_TRANSLATION_SINGLE_LOCALE', key, 'Translation group has only one locale');
  return { errors, warnings };
}
