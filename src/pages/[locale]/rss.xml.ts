import type { APIRoute } from 'astro';
import { locales, localePrefix, localeFromPrefix } from '../../i18n';
import { getContentGraph } from '../../utils/build-graph';
import { rssXml } from '../../utils/seo';
export function getStaticPaths() { return locales.map(locale => ({ params: { locale: localePrefix[locale] } })); }
export const GET: APIRoute = async ({ params, site }) => {
  const locale = localeFromPrefix(params.locale ?? '');
  if (!locale) throw new Error('Invalid RSS locale');
  const { graph } = await getContentGraph();
  return new Response(rssXml(graph.articles, locale, site?.href ?? 'http://localhost:4321', import.meta.env.BASE_URL), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
