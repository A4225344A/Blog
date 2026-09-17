import type { APIRoute } from 'astro';
import { locales, localePrefix, type Locale } from '../../i18n';
import { getContentGraph } from '../../utils/build-graph';
import { rssXml } from '../../utils/seo';
export function getStaticPaths() { return locales.map(locale => ({ params: { locale: localePrefix[locale] }, props: { locale } })); }
export const GET: APIRoute = async ({ props, site }) => {
  const { graph } = await getContentGraph();
  return new Response(rssXml(graph.articles, props.locale as Locale, site?.href ?? 'http://localhost:4321', import.meta.env.BASE_URL), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
