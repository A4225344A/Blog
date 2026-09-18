import type { Article, ContentGraph } from '../src/content/schemas';
export function article(overrides: Partial<Article> = {}): Article {
  return { id: 'article-en', slug: 'intro', title: 'Fixture', description: 'Test only', locale: 'en',
    translationKey: 'intro', contentType: 'concept', difficulty: 'beginner', topics: ['topic'], skills: ['skill'],
    prerequisiteSkills: [], recommendedArticles: [], status: 'published', ...overrides };
}
export function graph(): ContentGraph {
  return {
    articles: [article(), article({ id: 'article-zh', locale: 'zh-TW' })],
    topics: [{ id: 'topic', name: 'Topic', description: 'Test taxonomy' }],
    skills: [{ id: 'skill', name: 'Skill', description: 'Test dependency', category: 'testing', aliases: [], prerequisites: [], status: 'active' }],
    'learning-paths': [{ id: 'path', title: 'Path', description: 'Test path', targetAudience: [], sections: [{ id: 'section', title: 'Section', articleIds: ['article-zh', 'article-en'] }] }],
    projects: [{ id: 'project', title: 'Fixture project', description: 'Not a real project', maturity: 'experiment', featuredSkills: ['skill'], relatedArticles: ['article-en', 'article-zh'], relatedLearningPaths: ['path'] }],
  };
}
