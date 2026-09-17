import type { APIRoute } from 'astro';
import { getContentGraph } from '../utils/build-graph';
import { publicRoutes } from '../utils/catalog';
import { sitemapXml } from '../utils/seo';
export const GET: APIRoute = async ({ site }) => {
  const { graph } = await getContentGraph();
  return new Response(sitemapXml(publicRoutes(graph, import.meta.env.BASE_URL), site?.href ?? 'http://localhost:4321'), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
