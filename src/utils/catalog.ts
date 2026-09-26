import type { Article, ContentGraph, LearningPath } from '../content/schemas';
import { locales, type Locale } from '../i18n';
import { articlePath, localePath } from './routes';
import { sections } from '../i18n/ui';
import { legacyContentRoutes } from '../config/legacy-routes';
import { siteConfig } from '../config/site';
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
export function topicsWithArticles(graph: ContentGraph, locale: Locale) {
  const used = new Set(publishedArticles(graph.articles, locale).flatMap(article => article.topics));
  const order = new Map<string, number>(siteConfig.featuredTopicIds.map((id, index) => [id, index]));
  return graph.topics.filter(topic => used.has(topic.id)).sort((a, b) =>
    (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity) || a.id.localeCompare(b.id, 'en'));
}
export function orderedPathArticles(path: LearningPath, articles: Article[], locale: Locale) {
  const byId = new Map(publishedArticles(articles, locale).map(a => [a.id, a]));
  return path.sections.map(section => ({ ...section, articles: section.articleIds.flatMap(id => {
    const article = byId.get(id); return article ? [article] : [];
  }) }));
}
export function pathArticleNavigation(path: LearningPath, articles: Article[], locale: Locale, articleId: string) {
  const ordered = orderedPathArticles(path, articles, locale).flatMap(section => section.articles);
  const index = ordered.findIndex(article => article.id === articleId);
  return index < 0 ? undefined : { previous: ordered[index - 1], next: ordered[index + 1] };
}

/** Series order is owned by LearningPath; standalone articles remain chronological. */
export function readingOrder(articles: Article[], paths: LearningPath[], locale: Locale): Article[] {
  const candidates = new Map(publishedArticles(articles, locale).map(article => [article.id, article]));
  const result: Article[] = [];
  for (const path of [...paths].sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
    for (const section of path.sections) for (const id of section.articleIds) {
      const article = candidates.get(id);
      if (article) { result.push(article); candidates.delete(id); }
    }
  }
  return [...result, ...candidates.values()];
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
  const reserved = locales.flatMap(locale => legacyContentRoutes.map(route => localePath(locale, route.from, base)));
  const allRoutes = [...routes, ...reserved];
  if (new Set(allRoutes).size !== allRoutes.length) throw new Error('Public route collision: check Article slugs, entity IDs and reserved migration routes');
  return routes;
}
export function sitemapRoutes(graph: ContentGraph, base = '/') {
  const emptyTopics = new Set(locales.flatMap(locale => graph.topics
    .filter(topic => !publishedArticles(graph.articles, locale).some(article => article.topics.includes(topic.id)))
    .map(topic => localePath(locale, `topics/${encodeURIComponent(topic.id)}`, base))));
  return publicRoutes(graph, base).filter(route => !emptyTopics.has(route));
}
