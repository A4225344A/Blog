import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileURLToPath } from 'node:url';
import { schemas } from './content/schemas';
import { readContent, validateContent } from './utils/content-source';

// Validate raw files before a loader can collapse duplicate physical IDs.
const result = validateContent(await readContent(fileURLToPath(new URL('./content/', import.meta.url))));
if (result.errors.length) throw new Error(result.errors.map(e => `[${e.id}] ${e.entity}: ${e.message}`).join('\n'));

const generateId = ({ data }: { data: Record<string, unknown> }) => {
  if (typeof data.id !== 'string') throw new Error('Missing stable entity ID');
  return data.id;
};
export const collections = {
  articles: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/articles', generateId }), schema: schemas.articles }),
  skills: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/skills', generateId }), schema: schemas.skills }),
  topics: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/topics', generateId }), schema: schemas.topics }),
  'learning-paths': defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/learning-paths', generateId }), schema: schemas['learning-paths'] }),
  projects: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/projects', generateId }), schema: schemas.projects }),
};
