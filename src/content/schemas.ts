import { z } from 'zod';

const text = z.string().trim().min(1);
const ids = z.array(text);
export const articleSchema = z.object({
  id: text,
  slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text,
  description: text,
  locale: z.enum(['zh-TW', 'en']),
  translationKey: text,
  contentType: z.enum(['tutorial', 'concept', 'troubleshooting', 'case-study', 'reference', 'opinion']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  topics: ids,
  skills: ids,
  prerequisiteSkills: ids,
  recommendedArticles: ids,
  estimatedMinutesOverride: z.number().int().positive().optional(),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  status: z.enum(['draft', 'published', 'archived']),
}).strict();
export const skillSchema = z.object({
  id: text, name: text, category: text, description: text, aliases: ids,
  prerequisites: ids, status: z.enum(['active', 'deprecated']), supersededBy: text.optional(),
}).strict();
export const topicSchema = z.object({
  id: text, name: text, description: text, parentId: text.optional(),
}).strict();
export const learningPathSchema = z.object({
  id: text, title: text, description: text, targetAudience: ids,
  sections: z.array(z.object({ id: text, title: text, description: text.optional(), articleIds: ids }).strict()),
}).strict();
export const projectSchema = z.object({
  id: text, title: text, description: text,
  maturity: z.enum(['lab', 'prototype', 'production', 'experiment']),
  featuredSkills: ids, relatedArticles: ids, relatedLearningPaths: ids,
  repositoryUrl: z.string().url().optional(),
}).strict();
export const schemas = { articles: articleSchema, skills: skillSchema, topics: topicSchema,
  'learning-paths': learningPathSchema, projects: projectSchema };
export type Article = z.infer<typeof articleSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type LearningPath = z.infer<typeof learningPathSchema>;
export type Project = z.infer<typeof projectSchema>;
export interface ContentGraph {
  articles: Article[]; skills: Skill[]; topics: Topic[];
  'learning-paths': LearningPath[]; projects: Project[];
}
