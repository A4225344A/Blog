import type { Locale } from './index';
import type { ContentGraph, LearningPath } from '../content/schemas';
import type { Diagnostic } from '../utils/graph';
export type SharedCollection = Exclude<keyof ContentGraph, 'articles'>;
interface Text { title: string; description: string }
export interface EntityTranslations {
  topics: Record<string, Text>;
  skills: Record<string, Text>;
  'learning-paths': Record<string, Text & { targetAudience?: string[]; sections?: Record<string, Text> }>;
  projects: Record<string, Text>;
}
export const chinese: EntityTranslations = {
topics: {
  'web-foundations': { title: '網站建置', description: '靜態網站的工具選型、開發流程與內容交付。' },
  'platform-engineering': { title: '平台工程', description: '以可維護的工具、交付流程與文件支援工程團隊。' },
  'cloud-native': { title: '雲原生', description: '容器、宣告式基礎設施與分散式系統的設計。' },
  sre: { title: '網站可靠性工程', description: '從可觀測性、排障到可靠性實務。' },
  'ai-engineering': { title: 'AI 工程', description: 'AI 系統的工程設計、交付與維運。' },
  'backend-engineering': { title: '後端工程', description: '服務、介面與資料處理的工程基礎。' },
},
skills: {
  'terminal-basics': { title: '在終端機執行指令', description: '管理終端機工作目錄、工具版本與目前工作階段的環境變數。' },
  'local-website-preview': { title: '在電腦上預覽網站', description: '區分開發伺服器與建置產物預覽，檢查不同部署路徑。' },
  'editing-web-pages': { title: '編輯與儲存網頁', description: '編輯 HTML 與 CSS，檢查語意結構、連結與響應式版面。' },
  'astro-content-modeling': { title: 'Astro 內容建模', description: '使用型別與 schema 管理靜態內容。' },
  'static-site-delivery': { title: '靜態網站交付', description: '驗證並交付可部署的靜態產物。' },
  'aws-infrastructure': { title: 'AWS 基礎設施', description: '在架構實驗室中探索 AWS 基礎設施概念。' },
  'kubernetes-gitops': { title: 'Kubernetes GitOps', description: '使用 Git 管理宣告式 Kubernetes 交付。' },
  observability: { title: '可觀測性', description: '在實驗環境中觀察指標、日誌與系統行為。' },
  'ai-assisted-incident-handling': { title: 'AI 輔助事件處理', description: '在實驗室中探索 AI 輔助事件分析。' },
},
'learning-paths': {
  'knowledge-platform': { title: '用 Astro 建立技術部落格', description: '從空專案做到 GitHub Pages 上線，再整理雙語文章與系列順序。', targetAudience: ['工程師', '技術寫作者'], sections: {
    foundation: { title: '從建立專案到發布文章', description: '需要基本 HTML 與程式經驗。第二篇從工具安裝開始，第四篇接著說明雙語文章的管理方式。' },
  } },
},
projects: {
  'ai-sre-platform': { title: 'AI SRE Platform', description: '用來練習 AWS、Kubernetes GitOps、監控與 AI 輔助排障的實驗專案，目前定位為 lab，沒有用於正式環境。' },
},
};
export function entityText(collection: SharedCollection, entity: { id: string; title?: string; name?: string; description?: string }, locale: Locale) {
  return (locale === 'zh-TW' ? chinese[collection][entity.id] : undefined) ?? {
    title: entity.title ?? entity.name ?? entity.id, description: entity.description ?? '',
  };
}
export function sectionText(pathId: string, section: LearningPath['sections'][number], locale: Locale) {
  return (locale === 'zh-TW' ? chinese['learning-paths'][pathId]?.sections?.[section.id] : undefined) ?? section;
}
export function pathAudience(path: LearningPath, locale: Locale): string[] {
  return (locale === 'zh-TW' ? chinese['learning-paths'][path.id]?.targetAudience : undefined) ?? path.targetAudience;
}
export function validateEntityTranslations(graph: ContentGraph, translations: EntityTranslations) {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  for (const collection of ['topics', 'skills', 'learning-paths', 'projects'] as const) {
    const ids = new Set(graph[collection].map(entity => entity.id));
    for (const id of ids) if (!translations[collection][id]) warnings.push({ id: 'W_MISSING_ENTITY_TRANSLATION', entity: `${collection}/${id}`, message: 'Missing zh-TW translation; source text will be used' });
    for (const id of Object.keys(translations[collection])) if (!ids.has(id)) errors.push({ id: 'E_UNKNOWN_ENTITY_TRANSLATION', entity: `${collection}/${id}`, message: 'Translation refers to an unknown entity' });
  }
  for (const path of graph['learning-paths']) {
    const translation = translations['learning-paths'][path.id];
    if (path.targetAudience.length && !translation?.targetAudience) warnings.push({ id: 'W_MISSING_ENTITY_TRANSLATION', entity: `learning-paths/${path.id}/targetAudience`, message: 'Missing zh-TW audience; source text will be used' });
    for (const section of path.sections) if (!translation?.sections?.[section.id]) warnings.push({ id: 'W_MISSING_ENTITY_TRANSLATION', entity: `learning-paths/${path.id}/${section.id}`, message: 'Missing zh-TW section; source text will be used' });
    for (const id of Object.keys(translation?.sections ?? {})) if (!path.sections.some(section => section.id === id)) errors.push({ id: 'E_UNKNOWN_ENTITY_TRANSLATION', entity: `learning-paths/${path.id}/${id}`, message: 'Translation refers to an unknown section' });
  }
  return { errors, warnings };
}
