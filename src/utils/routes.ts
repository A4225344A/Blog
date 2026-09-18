import type { Article } from '../content/schemas';
import { localePrefix, type Locale } from '../i18n';
import { normalizeBase } from '../config/hosting';

/** Input is a site-relative path without a deployment prefix. */
export function withBase(path: string, base = '/'): string {
  if (/[?#\\]/.test(path) || path.startsWith('//') || /^[a-z]+:/i.test(path) || path.split('/').some(p => p === '.' || p === '..'))
    throw new Error('Expected a local site-relative path');
  return normalizeBase(base) + path.replace(/^\/+/, '');
}
export function localePath(locale: Locale, path = '', base = '/'): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return withBase(`${localePrefix[locale]}/${clean ? `${clean}/` : ''}`, base);
}
export function articlePath(article: Pick<Article, 'locale' | 'contentType' | 'slug'>, base = '/'): string {
  const section = article.contentType === 'troubleshooting' || article.contentType === 'case-study' ? 'cases' : 'blog';
  return localePath(article.locale, `${section}/${encodeURIComponent(article.slug)}`, base);
}
export function translatedArticlePath(article: Article, target: Locale, articles: Article[], base = '/'): string {
  const equivalent = articles.find(a => a.translationKey === article.translationKey && a.locale === target && a.status === 'published');
  return equivalent ? articlePath(equivalent, base) : localePath(target, '', base);
}
export function absoluteUrl(path: string, site: string): string {
  return new URL(path, site).href;
}
