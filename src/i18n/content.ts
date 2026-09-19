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
  'web-foundations': { title: '網站入門', description: '認識工具、在自己的電腦開啟網站，完成第一次修改。' },
  'platform-engineering': { title: '平台工程', description: '以可維護的工具、交付流程與文件支援工程團隊。' },
  'cloud-native': { title: '雲原生', description: '容器、宣告式基礎設施與分散式系統的設計。' },
  sre: { title: '網站可靠性工程', description: '從可觀測性、排障到可靠性實務。' },
  'ai-engineering': { title: 'AI 工程', description: 'AI 系統的工程設計、交付與維運。' },
  'backend-engineering': { title: '後端工程', description: '服務、介面與資料處理的工程基礎。' },
},
skills: {
  'terminal-basics': { title: '在終端機執行指令', description: '開啟 PowerShell，逐行執行指令並確認工具版本。' },
  'local-website-preview': { title: '在電腦上預覽網站', description: '找到專案資料夾、安裝所需套件，啟動與停止本機網站。' },
  'editing-web-pages': { title: '編輯與儲存網頁', description: '修改原始檔的標題、儲存、確認瀏覽器結果，並還原修改。' },
  'astro-content-modeling': { title: 'Astro 內容建模', description: '使用型別與 schema 管理靜態內容。' },
  'static-site-delivery': { title: '靜態網站交付', description: '驗證並交付可部署的靜態產物。' },
  'aws-infrastructure': { title: 'AWS 基礎設施', description: '在架構實驗室中探索 AWS 基礎設施概念。' },
  'kubernetes-gitops': { title: 'Kubernetes GitOps', description: '使用 Git 管理宣告式 Kubernetes 交付。' },
  observability: { title: '可觀測性', description: '在實驗環境中觀察指標、日誌與系統行為。' },
  'ai-assisted-incident-handling': { title: 'AI 輔助事件處理', description: '在實驗室中探索 AI 輔助事件分析。' },
},
'learning-paths': {
  'first-website': { title: '從零開始：我的第一個網站', description: '用 Windows 完成三個步驟：準備工具、在自己的電腦開啟這個網站、修改標題並看到結果。不需要程式經驗；這一階段尚不包含公開發布。', targetAudience: ['沒有程式經驗的讀者', '會下載檔案、使用瀏覽器的 Windows 使用者'], sections: {
    'first-local-change': { title: '準備工具 → 開啟網站 → 看到修改', description: '請依序閱讀。每篇都有操作、成功檢查與錯誤處理；頁首閱讀時間不包含安裝與練習。' },
  } },
  'knowledge-platform': { title: '建立工程知識平台', description: '給已能執行 Node.js 專案、修改網頁檔案的讀者：以中階架構角度理解內容模型、Astro 與 GitHub Pages 交付。', targetAudience: ['工程師', '技術寫作者'], sections: {
    foundation: { title: '從完整範例開始', description: '先理解實際儲存庫，再調整自己的內容。' },
  } },
},
projects: {
  'ai-sre-platform': { title: 'AI SRE Platform', description: '整合 AWS 基礎設施、Kubernetes GitOps、可觀測性與 AI 輔助事件處理的架構實驗室，用於學習、展示與實驗，不用於正式環境部署。' },
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
