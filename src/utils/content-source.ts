import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parseDocument } from 'yaml';
import { schemas, type ContentGraph } from '../content/schemas';
import { validateGraph, type Diagnostic } from './graph';
import { validateEntityTranslations, type EntityTranslations } from '../i18n/content';
import { articlePath } from './routes';

export interface RawEntry { collection: keyof ContentGraph; source: string; data: unknown; body: string }
export async function readContent(root: string): Promise<RawEntry[]> {
  const result: RawEntry[] = [];
  async function walk(directory: string, collection: keyof ContentGraph): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) { await walk(file, collection); continue; }
      if (!entry.isFile()) continue;
      if (/\.(mdx|ya?ml)$/.test(entry.name)) throw new Error(`${file}: Use Markdown Articles or JSON entities in Phase 1–3`);
      if (!/\.(md|json)$/.test(entry.name)) continue;
      const source = relative(root, file).replaceAll('\\', '/');
      const raw = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
      if (collection === 'articles') {
        if (!file.endsWith('.md')) throw new Error(`${source}: Articles must use Markdown`);
        const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
        if (!match) throw new Error(`${source}: Missing YAML frontmatter`);
        const yaml = parseDocument(match[1] ?? '', { uniqueKeys: true });
        if (yaml.errors.length) throw new Error(`${source}: ${yaml.errors.map(e => e.message).join('; ')}`);
        const data: unknown = yaml.toJS();
        result.push({ collection, source, data, body: raw.slice(match[0].length) });
      } else {
        if (!file.endsWith('.json')) throw new Error(`${source}: Non-Article entities must use JSON`);
        const data: unknown = JSON.parse(raw);
        result.push({ collection, source, data, body: '' });
      }
    }
  }
  for (const collection of Object.keys(schemas) as (keyof ContentGraph)[]) await walk(join(root, collection), collection);
  return result;
}

export function validateContent(entries: RawEntry[], translations?: EntityTranslations) {
  const graph: ContentGraph = { articles: [], skills: [], topics: [], 'learning-paths': [], projects: [] };
  const errors: Diagnostic[] = [];
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const data = entry.data;
    if (typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string') {
      const key = `${entry.collection}:${data.id.trim()}`;
      if (seen.has(key)) errors.push({ id: 'E_DUPLICATE_ID', entity: entry.source, message: `${key} also defined in ${seen.get(key)}` });
      seen.set(key, entry.source);
    }
    if (entry.collection === 'articles' && typeof data === 'object' && data !== null) {
      for (const field of ['order', 'level', 'learningPaths', 'projects', 'estimatedMinutes'])
        if (Object.hasOwn(data, field)) errors.push({ id: 'E_FORBIDDEN_ARTICLE_FIELD', entity: entry.source, message: field });
    }
    // Explicit branches preserve the relationship between each schema and its collection type.
    const ingest = <T>(schema: { parse: (input: unknown) => T }, target: T[]) => {
      try { target.push(schema.parse(data)); }
      catch (error: unknown) { errors.push({ id: 'E_SCHEMA', entity: entry.source, message: error instanceof Error ? error.message : String(error) }); }
    };
    switch (entry.collection) {
      case 'articles': ingest(schemas.articles, graph.articles); break;
      case 'skills': ingest(schemas.skills, graph.skills); break;
      case 'topics': ingest(schemas.topics, graph.topics); break;
      case 'learning-paths': ingest(schemas['learning-paths'], graph['learning-paths']); break;
      case 'projects': ingest(schemas.projects, graph.projects); break;
    }
  }
  const validation = validateGraph(graph);
  const routes = new Map<string, string>();
  for (const entry of entries.filter(entry => entry.collection === 'articles')) {
    const parsed = schemas.articles.safeParse(entry.data);
    if (!parsed.success || parsed.data.status !== 'published') continue;
    const route = articlePath(parsed.data);
    const previous = routes.get(route);
    if (previous) errors.push({ id: 'E_ROUTE_COLLISION', entity: entry.source, message: `${route} also rendered by ${previous}` });
    routes.set(route, entry.source);
  }
  const editorial = translations ? validateEntityTranslations(graph, translations) : { errors: [], warnings: [] };
  return { graph, errors: [...errors, ...validation.errors.filter(e => e.id !== 'E_DUPLICATE_ID'), ...editorial.errors], warnings: [...validation.warnings, ...editorial.warnings] };
}
