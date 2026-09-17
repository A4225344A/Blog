import { getCollection } from 'astro:content';
import { reverseIndexes, validateGraph } from './graph';
import { readingMinutes } from './reading-time';
import type { ContentGraph } from '../content/schemas';

/** Server/build-only; never import into browser scripts. */
export async function getContentGraph() {
  const [articles, skills, topics, paths, projects] = await Promise.all([
    getCollection('articles'), getCollection('skills'), getCollection('topics'),
    getCollection('learning-paths'), getCollection('projects'),
  ]);
  const graph: ContentGraph = {
    articles: articles.map(x => x.data), skills: skills.map(x => x.data), topics: topics.map(x => x.data),
    'learning-paths': paths.map(x => x.data), projects: projects.map(x => x.data),
  };
  const validation = validateGraph(graph);
  if (validation.errors.length) throw new Error(JSON.stringify(validation.errors));
  return { graph, reverse: reverseIndexes(graph), warnings: validation.warnings,
    readingTimes: new Map(articles.map(a => [a.data.id, readingMinutes(a.body ?? '', a.data.estimatedMinutesOverride)])),
  };
}
