import type { Article } from '../content/schemas';
import { articlePath, absoluteUrl, localePath, withBase } from './routes';
import { messages, localePrefix, type Locale } from '../i18n';
import { publishedArticles } from './catalog';
import { siteConfig } from '../config/site';

export function authorPerson(locale: Locale, site: string, base: string) {
  return {
    '@type': 'Person',
    '@id': `${absoluteUrl(localePath('zh-TW', 'about', base), site)}#author`,
    name: siteConfig.author.name[locale], alternateName: ['Jacky', '謝宇逸'],
    url: absoluteUrl(localePath(locale, 'about', base), site),
    sameAs: [siteConfig.author.githubUrl],
  };
}
export function aboutJsonLd(locale: Locale, site: string, base: string) {
  return { '@context': 'https://schema.org', ...authorPerson(locale, site, base) };
}
export function websiteJsonLd(site: string, base: string) {
  const url = absoluteUrl(base, site);
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${url}#website`,
    url, name: messages['zh-TW'].title, alternateName: messages.en.title,
    inLanguage: ['zh-TW', 'en'], publisher: authorPerson('zh-TW', site, base),
  };
}

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
    author: authorPerson(article.locale, site, base),
    publisher: authorPerson(article.locale, site, base),
    ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt.toISOString() } : {}),
  };
}
export function rssXml(articles: Article[], locale: Locale, site: string, base: string): string {
  const home = xmlEscape(absoluteUrl(localePath(locale, '', base), site));
  const self = xmlEscape(absoluteUrl(withBase(`${localePrefix[locale]}/rss.xml`, base), site));
  const items = publishedArticles(articles, locale).map(article => {
    const url = xmlEscape(absoluteUrl(articlePath(article, base), site));
    return `<item><dc:creator>${xmlEscape(siteConfig.author.name[locale])}</dc:creator><title>${xmlEscape(article.title)}</title><description>${xmlEscape(article.description)}</description><link>${url}</link><guid isPermaLink="false">${xmlEscape(article.id)}</guid>${article.publishedAt ? `<pubDate>${article.publishedAt.toUTCString()}</pubDate>` : ''}</item>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><dc:creator>${xmlEscape(siteConfig.author.name[locale])}</dc:creator><title>${xmlEscape(messages[locale].title)}</title><link>${home}</link><atom:link href="${self}" rel="self" type="application/rss+xml"/><description>${xmlEscape(messages[locale].tagline)}</description><language>${locale}</language>${items}</channel></rss>`;
}
export function sitemapXml(routes: string[], site: string, modified: ReadonlyMap<string, Date> = new Map()): string {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${xmlEscape(absoluteUrl(route, site))}</loc>${modified.has(route) ? `<lastmod>${modified.get(route)!.toISOString()}</lastmod>` : ''}</url>`).join('')}</urlset>`;
}
