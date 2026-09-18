import type { APIRoute } from 'astro';
import { absoluteUrl, withBase } from '../utils/routes';
export const GET: APIRoute = ({ site }) => new Response(`User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${absoluteUrl(withBase('sitemap.xml', import.meta.env.BASE_URL), site?.href ?? 'http://localhost:4321')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
