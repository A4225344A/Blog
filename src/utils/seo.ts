import type { Article } from '../content/schemas';
import { articlePath, absoluteUrl, localePath, withBase } from './routes';
import { messages, localePrefix, type Locale } from '../i18n';
import { publishedArticles } from './catalog';

export function xmlEscape(value: string): string {
  return value.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] ?? c);
}
export function safeJson(value: unknown): string { return JSON.stringify(value).replace(/</g, '\\u003c'); }
export function articleJsonLd(article: Article, site: string, base: string) {
  return {
    '@context': 'https://schema.org', '@type': article.contentType === 'opinion' ? 'Article' : 'TechArticle',
    headline: article.title, description: article.description, inLanguage: article.locale,
    url: absoluteUrl(articlePath(article, base), site),
    mainEntityOfPage: absoluteUrl(articlePath(article, base), site),
    ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt.toISOString() } : {}),
  };
}
export function rssXml(articles: Article[], locale: Locale, site: string, base: string): string {
  const home = xmlEscape(absoluteUrl(localePath(locale, '', base), site));
  const self = xmlEscape(absoluteUrl(withBase(`${localePrefix[locale]}/rss.xml`, base), site));
  const items = publishedArticles(articles, locale).map(article => {
    const url = xmlEscape(absoluteUrl(articlePath(article, base), site));
    return `<item><title>${xmlEscape(article.title)}</title><description>${xmlEscape(article.description)}</description><link>${url}</link><guid isPermaLink="false">${xmlEscape(article.id)}</guid>${article.publishedAt ? `<pubDate>${article.publishedAt.toUTCString()}</pubDate>` : ''}</item>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xmlEscape(messages[locale].title)}</title><link>${home}</link><atom:link href="${self}" rel="self" type="application/rss+xml"/><description>${xmlEscape(messages[locale].tagline)}</description><language>${locale}</language>${items}</channel></rss>`;
}
export function sitemapXml(routes: string[], site: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${xmlEscape(absoluteUrl(route, site))}</loc></url>`).join('')}</urlset>`;
}
