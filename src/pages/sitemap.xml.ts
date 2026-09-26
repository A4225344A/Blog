import type { APIRoute } from 'astro';
import { getContentGraph } from '../utils/build-graph';
import { sitemapRoutes, publishedArticles } from '../utils/catalog';
import { articlePath } from '../utils/routes';
import { sitemapXml } from '../utils/seo';
export const GET: APIRoute = async ({ site }) => {
  const { graph } = await getContentGraph();
  const base = import.meta.env.BASE_URL;
  const modified = new Map<string, Date>();
  for (const article of publishedArticles(graph.articles)) {
    const date = article.updatedAt ?? article.publishedAt;
    if (date) modified.set(articlePath(article, base), date);
  }
  return new Response(sitemapXml(sitemapRoutes(graph, base), site?.href ?? 'http://localhost:4321', modified), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
