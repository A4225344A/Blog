import type { Article, ContentGraph, LearningPath } from '../content/schemas';
import type { Locale } from '../i18n';
import { articlePath, localePath } from './routes';
import { sections } from '../i18n/ui';
export function resolveOrderedIds<T extends { id: string }>(ids: readonly string[], entries: readonly T[]): T[] {
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  return ids.flatMap(id => { const entry = byId.get(id); return entry ? [entry] : []; });
}
export function isCase(article: Article): boolean {
  return article.contentType === 'troubleshooting' || article.contentType === 'case-study';
}
export function publishedArticles(articles: Article[], locale?: Locale): Article[] {
  return articles.filter(a => a.status === 'published' && (!locale || a.locale === locale))
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) || a.id.localeCompare(b.id, 'en'));
}
export function orderedPathArticles(path: LearningPath, articles: Article[], locale: Locale) {
  const byId = new Map(publishedArticles(articles, locale).map(a => [a.id, a]));
  return path.sections.map(section => ({ ...section, articles: section.articleIds.flatMap(id => {
    const article = byId.get(id); return article ? [article] : [];
  }) }));
}
export function publicRoutes(graph: ContentGraph, base = '/') {
  const routes = [base];
  for (const locale of ['zh-TW', 'en'] as const) {
    routes.push(localePath(locale, '', base));
    for (const section of [...sections, 'search']) routes.push(localePath(locale, section, base));
    for (const [section, entries] of [['topics', graph.topics], ['learn', graph['learning-paths']], ['projects', graph.projects]] as const)
      for (const entry of entries) routes.push(localePath(locale, `${section}/${encodeURIComponent(entry.id)}`, base));
  }
  for (const article of publishedArticles(graph.articles)) routes.push(articlePath(article, base));
  if (new Set(routes).size !== routes.length) throw new Error('Public route collision: check Article slugs and entity IDs');
  return routes;
}
